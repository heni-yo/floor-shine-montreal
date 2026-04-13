import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_ROOT } from '../paths.js';
import { nextSubmissionNumber } from './submissionNumber.js';
import {
  deleteSubmissionFromSupabase,
  downloadSubmissionFileFromSupabase,
  getNextSubmissionIdFromSupabase,
  isSupabaseMode,
  listFilesInSubmissionStorage,
  listSubmissionsFromSupabase,
  submissionExistsInSupabase,
} from './supabaseSubmissions.js';
import {
  deleteSubmissionRow,
  listSubmissionsFromDb,
  type SubmissionMeta,
} from './submissionsDb.js';

export type { SubmissionMeta };

export { isSupabaseMode };

export async function getNextSubmissionId(): Promise<string> {
  if (isSupabaseMode()) return getNextSubmissionIdFromSupabase();
  return nextSubmissionNumber();
}

export async function listSubmissions(): Promise<SubmissionMeta[]> {
  if (isSupabaseMode()) return listSubmissionsFromSupabase();
  return listSubmissionsFromDb();
}

export async function listSubmissionFiles(id: string): Promise<string[]> {
  if (isSupabaseMode()) return listFilesInSubmissionStorage(id);
  const dir = path.join(UPLOAD_ROOT, id);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f !== 'meta.json');
}

export async function readSubmissionFile(id: string, filename: string): Promise<Buffer> {
  if (isSupabaseMode()) return downloadSubmissionFileFromSupabase(id, filename);
  return fs.readFileSync(path.join(UPLOAD_ROOT, id, filename));
}

export async function submissionExists(id: string): Promise<boolean> {
  if (isSupabaseMode()) return submissionExistsInSupabase(id);
  return fs.existsSync(path.join(UPLOAD_ROOT, id));
}

export async function deleteSubmissionEverywhere(id: string): Promise<boolean> {
  if (isSupabaseMode()) return deleteSubmissionFromSupabase(id);
  const dir = path.join(UPLOAD_ROOT, id);
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  try {
    deleteSubmissionRow(id);
  } catch {
    /* */
  }
  return true;
}
