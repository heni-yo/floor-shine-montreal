import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_ROOT } from '../app.js';

const router = Router();

interface SubmissionMeta {
  submissionId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  services: Record<string, unknown>;
  photos: string[];
}

router.get('/api/admin/submissions', (_req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_ROOT)) {
      return res.json([]);
    }
    const dirs = fs.readdirSync(UPLOAD_ROOT).filter((d) => d.startsWith('EST-'));
    const submissions: SubmissionMeta[] = [];
    for (const dir of dirs) {
      const metaPath = path.join(UPLOAD_ROOT, dir, 'meta.json');
      if (fs.existsSync(metaPath)) {
        try {
          const raw = fs.readFileSync(metaPath, 'utf8');
          submissions.push(JSON.parse(raw) as SubmissionMeta);
        } catch {
          /* skip corrupted */
        }
      }
    }
    submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(submissions);
  } catch (e) {
    console.error('[admin] list error', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/api/admin/submissions/:id/files', (req, res) => {
  const dir = path.join(UPLOAD_ROOT, req.params.id);
  if (!fs.existsSync(dir)) return res.status(404).json({ error: 'Non trouvé' });
  const files = fs.readdirSync(dir).filter((f) => f !== 'meta.json');
  return res.json(files);
});

router.get('/api/admin/submissions/:id/file/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_ROOT, req.params.id, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Fichier non trouvé' });
  return res.sendFile(filePath);
});

router.delete('/api/admin/submissions/:id', (req, res) => {
  const code = req.query.code as string;
  if (code !== '2580') {
    return res.status(403).json({ error: 'Code de confirmation invalide.' });
  }
  const dir = path.join(UPLOAD_ROOT, req.params.id);
  if (!fs.existsSync(dir)) return res.status(404).json({ error: 'Non trouvé' });
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    return res.json({ ok: true });
  } catch (e) {
    console.error('[admin] delete error', e);
    return res.status(500).json({ error: 'Erreur de suppression' });
  }
});

export default router;
