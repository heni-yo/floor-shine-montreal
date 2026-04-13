import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseQuotePayload } from './lib/quoteSchema.js';
import { nextSubmissionNumber } from './lib/submissionNumber.js';
import { buildEstimate } from './lib/estimate.js';
import { generateQuoteExcel } from './lib/excelQuote.js';
import { sendQuoteEmails, MailConfigError } from './lib/mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const UPLOAD_ROOT = path.join(ROOT, 'uploads');

export function ensureUploadDirs() {
  fs.mkdirSync(path.join(UPLOAD_ROOT, 'temp'), { recursive: true });
}

function clientError(res: express.Response, status: number, message: string, code?: string) {
  return res.status(status).json({ error: { message, code: code ?? 'ERROR' } });
}

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

  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  app.use(
    cors({
      origin:
        frontendOrigin && frontendOrigin.length > 0
          ? frontendOrigin.split(',').map((o) => o.trim())
          : true,
      credentials: false,
    }),
  );

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

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
      const base = path.basename(file.originalname).replace(/[^\w.-]+/g, '_');
      cb(null, `${Date.now()}-${base}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024, files: 10 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Seules les images sont acceptées.'));
        return;
      }
      cb(null, true);
    },
  });

  app.post(
    '/api/quote',
    (req, res, next) => {
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

        const submissionId = nextSubmissionNumber();
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

        const mailFrom = process.env.MAIL_FROM || 'sablage@talonplancher.com';
        const mailInternal = process.env.MAIL_TO_INTERNAL || 'sablage@talonplancher.com';

        await sendQuoteEmails({
          clientEmail: payload.email,
          internalEmail: mailInternal,
          fromAddress: mailFrom,
          submissionId,
          excelBuffer,
          photoPaths,
          clientName: `${payload.firstName} ${payload.lastName}`.trim(),
        });

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
        if (err instanceof MailConfigError) {
          return clientError(res, 503, err.message, 'EMAIL_NOT_CONFIGURED');
        }
        const errMsg = err.message ?? '';
        if (/domain is not verified/i.test(errMsg) || /verify your domain/i.test(errMsg)) {
          return clientError(
            res,
            503,
            'Le domaine de l’adresse d’envoi (MAIL_FROM) n’est pas vérifié dans Resend. Ajoutez ce domaine et complétez la vérification DNS sur https://resend.com/domains.',
            'RESEND_DOMAIN_NOT_VERIFIED',
          );
        }
        if (
          /\[resend:invalid_api_key\]|\[resend:missing_api_key\]/i.test(errMsg) ||
          /invalid api key/i.test(errMsg)
        ) {
          return clientError(
            res,
            503,
            'Clé API Resend refusée ou absente. Vérifiez RESEND_API_KEY dans les variables d’environnement du service (Render).',
            'RESEND_API_KEY_INVALID',
          );
        }
        if (/\[resend:restricted_api_key\]/i.test(errMsg)) {
          return clientError(
            res,
            503,
            'Cette clé Resend est restreinte et ne permet pas l’envoi. Créez une clé « Full access » ou adaptez les permissions sur resend.com/api-keys.',
            'RESEND_API_KEY_RESTRICTED',
          );
        }
        if (/\[resend:monthly_quota_exceeded\]|\[resend:daily_quota_exceeded\]|\[resend:rate_limit_exceeded\]/i.test(errMsg)) {
          return clientError(
            res,
            503,
            'Quota ou limite d’envoi Resend atteint. Réessayez plus tard ou vérifiez votre forfait sur resend.com.',
            'RESEND_QUOTA',
          );
        }
        console.error('[quote]', err);
        const verbose =
          process.env.QUOTE_VERBOSE_ERRORS?.trim() === '1' ||
          process.env.QUOTE_VERBOSE_ERRORS?.trim().toLowerCase() === 'true';
        const showDetail = process.env.NODE_ENV !== 'production' || verbose;
        return clientError(
          res,
          500,
          showDetail ? err.message || 'Erreur serveur' : 'Une erreur est survenue. Veuillez réessayer plus tard.',
          'SERVER',
        );
      }
    },
  );

  app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
      if (err instanceof Error) {
        console.error('[api]', err);
        return clientError(res, 500, err.message || 'Erreur serveur', 'SERVER');
      }
      return clientError(res, 500, 'Erreur serveur', 'SERVER');
    },
  );

  return app;
}
