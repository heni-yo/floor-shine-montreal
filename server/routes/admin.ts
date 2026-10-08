import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  deleteSubmissionEverywhere,
  listSubmissionFiles,
  listSubmissions,
  readSubmissionFile,
  submissionExists,
} from '../lib/submissionsStore.js';
import { contentTypeForDownload } from '../lib/supabaseSubmissions.js';
import { getExpectedAdminToken, isAdminAuthorized } from '../lib/adminAuth.js';
import { createRateLimiter, isSafeFilename, isValidSubmissionId } from '../lib/security.js';

const router = Router();

/** 10 jetons invalides par IP et par quart d'heure, puis blocage temporaire. */
const failedLogins = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Trop de tentatives. Réessayez plus tard.',
});

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // Données personnelles : jamais en cache, ni chez un proxy ni dans le navigateur.
  res.setHeader('Cache-Control', 'no-store');

  if (!getExpectedAdminToken()) {
    res.status(503).json({
      error: 'Configuration serveur incomplète : définissez ADMIN_API_TOKEN (secret fort, jamais dans le front).',
    });
    return;
  }
  const retryAfter = failedLogins.isBlocked(req);
  if (retryAfter) {
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' });
    return;
  }
  if (!isAdminAuthorized(req)) {
    failedLogins.hit(req);
    res.status(401).json({ error: 'Non autorisé.' });
    return;
  }
  next();
}

/** Ne protéger que `/api/admin/*` — sinon `POST /api/quote` passait ici et recevait 401. */
router.use('/api/admin', requireAdmin);

/**
 * Validation des paramètres avant tout accès disque ou Supabase. Sans elle,
 * un id comme « .. » (ou « ..%2F.. ») faisait sortir path.join du dossier
 * des soumissions — en lecture comme en suppression récursive.
 */
router.param('id', (_req, res, next, id) => {
  if (!isValidSubmissionId(id)) return res.status(400).json({ error: 'Numéro de soumission invalide.' });
  next();
});
router.param('filename', (_req, res, next, filename) => {
  if (!isSafeFilename(filename)) return res.status(400).json({ error: 'Nom de fichier invalide.' });
  next();
});

router.get('/api/admin/submissions', async (_req, res) => {
  try {
    return res.json(await listSubmissions());
  } catch (e) {
    console.error('[admin] list error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/api/admin/submissions/:id/files', async (req, res) => {
  try {
    const id = req.params.id;
    const files = await listSubmissionFiles(id);
    if (!(await submissionExists(id)) && files.length === 0) {
      return res.status(404).json({ error: 'Non trouvé' });
    }
    return res.json(files);
  } catch (e) {
    console.error('[admin] files list', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/api/admin/submissions/:id/file/:filename', async (req, res) => {
  try {
    const { id, filename } = req.params;
    const buf = await readSubmissionFile(id, filename);
    const type = contentTypeForDownload(filename);
    res.setHeader('Content-Type', type);
    // Les fichiers téléversés ne doivent jamais s'exécuter dans le navigateur.
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    if (!type.startsWith('image/')) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    return res.send(buf);
  } catch {
    return res.status(404).json({ error: 'Fichier non trouvé' });
  }
});

/**
 * Suppression : le client doit renvoyer le numéro exact de la soumission en
 * confirmation. Remplace l'ancien code fixe « 2580 », écrit en clair dans le
 * JavaScript public de la page — donc lisible par n'importe qui.
 */
router.delete('/api/admin/submissions/:id', async (req, res) => {
  const id = req.params.id;
  const confirm = typeof req.query.confirm === 'string' ? req.query.confirm.trim() : '';
  if (confirm !== id) {
    return res.status(400).json({ error: 'Confirmation invalide : saisissez le numéro exact de la soumission.' });
  }
  try {
    const ok = await deleteSubmissionEverywhere(id);
    if (!ok) {
      return res.status(404).json({ error: 'Non trouvé' });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('[admin] delete error', e);
    return res.status(500).json({ error: 'Erreur de suppression' });
  }
});

export default router;
