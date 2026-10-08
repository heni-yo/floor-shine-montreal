import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseQuotePayload } from './lib/quoteSchema.js';
import adminRoutes from './routes/admin.js';
import { buildEstimate } from './lib/estimate.js';
import { generateQuoteExcel } from './lib/excelQuote.js';
import { generateQuotePdf } from './lib/pdfQuote.js';
import { sendQuoteEmails, MailConfigError } from './lib/mailer.js';
import { insertSubmission } from './lib/submissionsDb.js';
import { getNextSubmissionId, isSupabaseMode } from './lib/submissionsStore.js';
import { persistQuoteToSupabase } from './lib/supabaseSubmissions.js';
import { createRateLimiter, isAllowedImageUpload } from './lib/security.js';
import { COMPANY } from './config/company.js';
import { UPLOAD_ROOT } from './paths.js';

export function ensureUploadDirs() {
  fs.mkdirSync(path.join(UPLOAD_ROOT, 'temp'), { recursive: true });
}

function clientError(res: express.Response, status: number, message: string, code?: string) {
  return res.status(status).json({ error: { message, code: code ?? 'ERROR' } });
}

/** Détails techniques visibles seulement en dev, ou si QUOTE_VERBOSE_ERRORS est activé. */
function showErrorDetail(): boolean {
  const verbose = process.env.QUOTE_VERBOSE_ERRORS?.trim().toLowerCase();
  return process.env.NODE_ENV !== 'production' || verbose === '1' || verbose === 'true';
}

const GENERIC_SEND_ERROR = `L’envoi est temporairement indisponible. Veuillez réessayer plus tard ou nous appeler au ${COMPANY.phone}.`;

/**
 * Sous Windows, renommer tout le dossier temporaire après Multer provoque souvent EPERM
 * (fichiers encore verrouillés). On déplace chaque fichier puis on supprime le dossier vide.
 */
function moveSessionFilesToSubmission(tempDir: string, finalDir: string): void {
  fs.mkdirSync(finalDir, { recursive: true });
  let names: string[] = [];
  try {
    names = fs.readdirSync(tempDir);
  } catch {
    return;
  }
  for (const name of names) {
    const from = path.join(tempDir, name);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(from);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;
    const to = path.join(finalDir, name);
    try {
      fs.renameSync(from, to);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EXDEV') {
        fs.copyFileSync(from, to);
        try {
          fs.unlinkSync(from);
        } catch {
          /* fichier source parfois déjà supprimé ou verrouillé */
        }
      } else {
        throw e;
      }
    }
  }
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    /* dossier temporaire : nettoyage best-effort */
  }
}

export function createApp() {
  const app = express();

  // Ne pas annoncer la technologie du serveur.
  app.disable('x-powered-by');
  // Render place l'API derrière un proxy : sans ceci, toutes les requêtes
  // auraient l'IP du proxy et la limitation de débit bloquerait tout le monde.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  app.use(
    cors({
      origin:
        frontendOrigin && frontendOrigin.length > 0
          ? frontendOrigin.split(',').map((o) => o.trim())
          : true,
      credentials: false,
      methods: ['GET', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  app.use(adminRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'quote-api' });
  });

  const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
      const sessionId = (req as express.Request & { uploadSessionId?: string }).uploadSessionId;
      if (!sessionId) {
        return cb(new Error('Session de téléversement manquante'), '');
      }
      const dir = path.join(UPLOAD_ROOT, 'temp', sessionId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      // Caractères sûrs uniquement, et jamais « .. » (refusé ensuite par l'historique).
      const base = path
        .basename(file.originalname)
        .replace(/[^\w.-]+/g, '_')
        .replace(/\.{2,}/g, '.')
        .slice(-120);
      cb(null, `${Date.now()}-${base}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024, files: 10, fields: 10, fieldSize: 64 * 1024 },
    fileFilter: (_req, file, cb) => {
      // Le type MIME est déclaré par le navigateur : on exige aussi une extension d'image.
      if (!isAllowedImageUpload(file.originalname, file.mimetype)) {
        cb(new Error('Seules les images sont acceptées.'));
        return;
      }
      cb(null, true);
    },
  });

  /**
   * Un client légitime envoie une demande ; 8 par quart d'heure laisse de la
   * marge pour les erreurs de saisie tout en bloquant l'envoi en rafale (qui
   * remplirait la boîte courriel, le quota Resend et le stockage).
   */
  const quoteLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: `Trop de demandes envoyées. Veuillez réessayer plus tard ou nous appeler au ${COMPANY.phone}.`,
  });

  app.post(
    '/api/quote',
    (req, res, next) => quoteLimiter.middleware(req, res, next),
    (req, _res, next) => {
      (req as express.Request & { uploadSessionId: string }).uploadSessionId = randomUUID();
      next();
    },
    upload.array('photos', 10),
    async (req, res) => {
      const sessionId = (req as express.Request & { uploadSessionId: string }).uploadSessionId;
      const tempDir = path.join(UPLOAD_ROOT, 'temp', sessionId);
      let submissionFolder: string | undefined;

      const cleanupTemp = () => {
        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch {
          /* ignore */
        }
      };

      const cleanupSubmissionFolder = () => {
        if (!submissionFolder) return;
        try {
          if (fs.existsSync(submissionFolder)) {
            fs.rmSync(submissionFolder, { recursive: true, force: true });
          }
        } catch {
          /* ignore */
        }
      };

      // Champ piège invisible pour les humains : un robot qui remplit tout le
      // formulaire le remplit aussi. On répond « succès » sans rien enregistrer,
      // pour ne pas lui indiquer qu'il a été détecté.
      if (typeof req.body?.website === 'string' && req.body.website.trim() !== '') {
        cleanupTemp();
        console.warn('[quote] envoi ignoré (champ piège rempli)');
        return res.status(201).json({ ok: true, submissionId: 'EST-0000-0000', message: 'Soumission envoyée.' });
      }

      try {
        let raw: unknown;
        const bodyData = req.body?.data;
        if (typeof bodyData === 'string') {
          raw = JSON.parse(bodyData);
        } else {
          cleanupTemp();
          return clientError(res, 400, 'Champ « data » JSON manquant ou invalide.', 'INVALID_BODY');
        }

        const parsed = parseQuotePayload(raw);
        if (!parsed.success) {
          cleanupTemp();
          const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
          return clientError(res, 400, msg || 'Données invalides.', 'VALIDATION');
        }

        const payload = parsed.data;
        if (!payload.services.floor && !payload.services.stairs && !payload.services.repair) {
          cleanupTemp();
          return clientError(res, 400, 'Sélectionnez au moins un service.', 'VALIDATION');
        }

        const phoneOk = /^[\d\s()+ -]{10,}$/.test(payload.phone);
        if (!phoneOk) {
          cleanupTemp();
          return clientError(res, 400, 'Numéro de téléphone invalide.', 'VALIDATION');
        }

        const postalNorm = payload.postalCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        const postalOk = /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(postalNorm);
        if (!postalOk) {
          cleanupTemp();
          return clientError(res, 400, 'Code postal invalide.', 'VALIDATION');
        }

        const submissionId = await getNextSubmissionId();
        const finalDir = path.join(UPLOAD_ROOT, submissionId);
        if (fs.existsSync(finalDir)) {
          cleanupTemp();
          return clientError(res, 500, 'Conflit de stockage. Réessayez.', 'STORAGE');
        }

        moveSessionFilesToSubmission(tempDir, finalDir);
        submissionFolder = finalDir;

        const files = (req.files ?? []) as Express.Multer.File[];
        const photoPaths = files.map((f) => path.join(finalDir, path.basename(f.path)));

        const estimate = buildEstimate(payload);
        const createdAt = new Date();
        const excelBuffer = await generateQuoteExcel({
          submissionId,
          createdAt,
          payload,
          estimate,
        });
        fs.writeFileSync(path.join(finalDir, 'quote.xlsx'), excelBuffer);

        // PDF : un échec ne doit pas bloquer la demande — l'Excel suffit à la traiter.
        let pdfBuffer: Buffer | null = null;
        try {
          pdfBuffer = await generateQuotePdf({ submissionId, createdAt, payload, estimate, photoPaths });
          fs.writeFileSync(path.join(finalDir, 'quote.pdf'), pdfBuffer);
        } catch (e) {
          console.error('[quote] génération du PDF', e);
        }

        const meta = {
          submissionId,
          createdAt: createdAt.toISOString(),
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          city: payload.city,
          postalCode: payload.postalCode,
          services: payload.services,
          photos: files.map((f) => path.basename(f.path)),
        };

        const mailFrom = process.env.MAIL_FROM || 'sablage@talonplancher.com';
        const mailInternal = process.env.MAIL_TO_INTERNAL || 'sablage@talonplancher.com';
        const clientName = `${payload.firstName} ${payload.lastName}`.trim();

        if (isSupabaseMode()) {
          const photoAttachments = files.map((f) => {
            const name = path.basename(f.path);
            return { filename: name, buffer: fs.readFileSync(path.join(finalDir, name)) };
          });
          // Envoie tout le dossier (photos, quote.xlsx, quote.pdf) vers le stockage.
          await persistQuoteToSupabase(meta, finalDir);
          await sendQuoteEmails({
            clientEmail: payload.email,
            internalEmail: mailInternal,
            fromAddress: mailFrom,
            submissionId,
            excelBuffer,
            pdfBuffer,
            photoPaths: [],
            photoAttachments,
            clientName,
          });
          try {
            fs.rmSync(finalDir, { recursive: true, force: true });
          } catch {
            /* */
          }
          submissionFolder = undefined;
        } else {
          fs.writeFileSync(path.join(finalDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
          await sendQuoteEmails({
            clientEmail: payload.email,
            internalEmail: mailInternal,
            fromAddress: mailFrom,
            submissionId,
            excelBuffer,
            pdfBuffer,
            photoPaths,
            clientName,
          });
          try {
            insertSubmission(meta);
          } catch (e) {
            console.error('[quote] enregistrement base SQLite', e);
          }
        }

        return res.status(201).json({
          ok: true,
          submissionId,
          message: 'Soumission envoyée.',
        });
      } catch (e) {
        cleanupTemp();
        cleanupSubmissionFolder();
        const err = e as Error & { code?: string };
        if (err instanceof SyntaxError) {
          return clientError(res, 400, 'JSON invalide dans le champ « data ».', 'INVALID_JSON');
        }
        if (err.message?.includes('Seules les images')) {
          return clientError(res, 400, err.message, 'INVALID_FILE');
        }

        // Erreurs de configuration ou de quota Resend : le détail reste dans les
        // journaux du serveur, le visiteur ne voit qu'un message neutre.
        console.error('[quote]', err);
        const detail = showErrorDetail();
        const errMsg = err.message ?? '';
        if (err instanceof MailConfigError) {
          return clientError(res, 503, detail ? err.message : GENERIC_SEND_ERROR, 'EMAIL_NOT_CONFIGURED');
        }
        if (/domain is not verified|verify your domain/i.test(errMsg)) {
          return clientError(
            res,
            503,
            detail
              ? 'Le domaine de l’adresse d’envoi (MAIL_FROM) n’est pas vérifié dans Resend : complétez la vérification DNS sur https://resend.com/domains.'
              : GENERIC_SEND_ERROR,
            'RESEND_DOMAIN_NOT_VERIFIED',
          );
        }
        if (/\[resend:(invalid_api_key|missing_api_key|restricted_api_key)\]|invalid api key/i.test(errMsg)) {
          return clientError(
            res,
            503,
            detail ? 'Clé API Resend refusée, absente ou restreinte : vérifiez RESEND_API_KEY.' : GENERIC_SEND_ERROR,
            'RESEND_API_KEY_INVALID',
          );
        }
        if (/\[resend:(monthly_quota_exceeded|daily_quota_exceeded|rate_limit_exceeded)\]/i.test(errMsg)) {
          return clientError(
            res,
            503,
            detail ? 'Quota ou limite d’envoi Resend atteint.' : GENERIC_SEND_ERROR,
            'RESEND_QUOTA',
          );
        }
        return clientError(
          res,
          500,
          detail ? errMsg || 'Erreur serveur' : 'Une erreur est survenue. Veuillez réessayer plus tard.',
          'SERVER',
        );
      }
    },
  );

  app.use(
    (err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      // Téléversement refusé en cours de route : les fichiers déjà reçus ne
      // doivent pas s'accumuler dans uploads/temp.
      const sessionId = (req as express.Request & { uploadSessionId?: string }).uploadSessionId;
      if (sessionId) {
        try {
          fs.rmSync(path.join(UPLOAD_ROOT, 'temp', sessionId), { recursive: true, force: true });
        } catch {
          /* best-effort */
        }
      }
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return clientError(res, 413, 'Chaque photo doit faire au plus 8 Mo.', 'FILE_TOO_LARGE');
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return clientError(res, 400, 'Maximum 10 photos.', 'TOO_MANY_FILES');
        }
        return clientError(res, 400, 'Téléversement invalide.', 'UPLOAD');
      }
      if (err instanceof Error && err.message.includes('Seules les images')) {
        return clientError(res, 400, err.message, 'INVALID_FILE');
      }
      console.error('[api]', err);
      // Auparavant, err.message partait tel quel au visiteur, même en production.
      const message = showErrorDetail() && err instanceof Error ? err.message : 'Erreur serveur';
      return clientError(res, 500, message, 'SERVER');
    },
  );

  return app;
}
