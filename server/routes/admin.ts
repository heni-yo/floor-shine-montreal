import { Router } from 'express';
import {
  deleteSubmissionEverywhere,
  listSubmissionFiles,
  listSubmissions,
  readSubmissionFile,
  submissionExists,
} from '../lib/submissionsStore.js';
import { contentTypeForDownload } from '../lib/supabaseSubmissions.js';
import { requireAdmin } from '../lib/adminAuth.js';

const router = Router();

/** Ne protéger que `/api/admin/*` — sinon `POST /api/quote` passait ici et recevait 401. */
router.use('/api/admin', requireAdmin);

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
    const buf = await readSubmissionFile(req.params.id, req.params.filename);
    res.setHeader('Content-Type', contentTypeForDownload(req.params.filename));
    return res.send(buf);
  } catch {
    return res.status(404).json({ error: 'Fichier non trouvé' });
  }
});

router.delete('/api/admin/submissions/:id', async (req, res) => {
  try {
    const ok = await deleteSubmissionEverywhere(req.params.id);
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
