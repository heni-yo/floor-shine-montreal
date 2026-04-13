import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Répertoire `server/` */
export const SERVER_DIR = __dirname;
export const PROJECT_ROOT = path.join(SERVER_DIR, '..');

/**
 * Photos, Excel, meta.json par soumission.
 * En production : monter un volume persistant et définir UPLOAD_DIR vers ce dossier.
 */
export const UPLOAD_ROOT = process.env.UPLOAD_DIR?.trim()
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(PROJECT_ROOT, 'uploads');

/**
 * Compteur EST-*, base SQLite par défaut.
 * En production : même volume que UPLOAD_DIR ou dossier dédié persistant.
 */
export const SERVER_DATA_DIR = process.env.SERVER_DATA_DIR?.trim()
  ? path.resolve(process.env.SERVER_DATA_DIR)
  : path.join(SERVER_DIR, 'data');
