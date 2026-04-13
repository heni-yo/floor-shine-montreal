import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import type { SubmissionMeta } from './submissionsDb.js';

export function isSupabaseMode(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function bucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'quote-submissions';
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL!.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function guessMime(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith('.xlsx')) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.gif')) return 'image/gif';
  if (n.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

export function contentTypeForDownload(filename: string): string {
  return guessMime(filename);
}

export async function getNextSubmissionIdFromSupabase(): Promise<string> {
  const supabase = getClient();
  const year = new Date().getFullYear();
  const prefix = `EST-${year}-`;
  const { data, error } = await supabase
    .from('submissions')
    .select('submission_id')
    .like('submission_id', `${prefix}%`);
  if (error) throw new Error(`Supabase soumissions: ${error.message}`);
  let max = 0;
  const pat = new RegExp(`^EST-${year}-(\\d{4})$`);
  for (const row of data ?? []) {
    const m = pat.exec(row.submission_id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

/** Envoie les fichiers du dossier local vers Storage puis insère la ligne (sans meta.json). */
export async function persistQuoteToSupabase(meta: SubmissionMeta, localDir: string): Promise<void> {
  const supabase = getClient();
  const b = bucketName();
  const id = meta.submissionId;
  const names = fs.readdirSync(localDir);
  for (const name of names) {
    if (name === 'meta.json') continue;
    const filePath = path.join(localDir, name);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;
    const buf = fs.readFileSync(filePath);
    const objectPath = `${id}/${name}`;
    const { error: upErr } = await supabase.storage.from(b).upload(objectPath, buf, {
      contentType: guessMime(name),
      upsert: true,
    });
    if (upErr) throw new Error(`Storage « ${name} » : ${upErr.message}`);
  }

  const { error: insErr } = await supabase.from('submissions').insert({
    submission_id: meta.submissionId,
    created_at: meta.createdAt,
    first_name: meta.firstName,
    last_name: meta.lastName,
    email: meta.email,
    phone: meta.phone,
    city: meta.city,
    postal_code: meta.postalCode,
    services: meta.services,
    photos: meta.photos,
  });
  if (insErr) throw new Error(`Base Supabase : ${insErr.message}`);
}

function rowToMeta(row: {
  submission_id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  services: Record<string, unknown>;
  photos: unknown;
}): SubmissionMeta {
  const photos = Array.isArray(row.photos) ? (row.photos as string[]) : [];
  const created =
    typeof row.created_at === 'string'
      ? row.created_at
      : new Date(row.created_at as unknown as string).toISOString();
  return {
    submissionId: row.submission_id,
    createdAt: created,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    postalCode: row.postal_code,
    services: row.services ?? {},
    photos,
  };
}

export async function listSubmissionsFromSupabase(): Promise<SubmissionMeta[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToMeta);
}

export async function listFilesInSubmissionStorage(id: string): Promise<string[]> {
  const supabase = getClient();
  const b = bucketName();
  const { data, error } = await supabase.storage.from(b).list(id, {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) {
    if (/not\s*found|404/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((f) => f.name).filter(Boolean);
}

export async function downloadSubmissionFileFromSupabase(
  id: string,
  filename: string,
): Promise<Buffer> {
  const supabase = getClient();
  const b = bucketName();
  const objectPath = `${id}/${filename}`;
  const { data, error } = await supabase.storage.from(b).download(objectPath);
  if (error) throw new Error(error.message);
  const ab = await data.arrayBuffer();
  return Buffer.from(ab);
}

/** Retourne true si une ligne ou des fichiers ont été supprimés. */
export async function deleteSubmissionFromSupabase(id: string): Promise<boolean> {
  const supabase = getClient();
  const b = bucketName();
  const { data: listed } = await supabase.storage.from(b).list(id, { limit: 100 });
  const names = (listed ?? []).map((x) => x.name).filter(Boolean);
  if (names.length) {
    const paths = names.map((n) => `${id}/${n}`);
    const { error: rmErr } = await supabase.storage.from(b).remove(paths);
    if (rmErr) console.error('[supabase] suppression fichiers', rmErr.message);
  }
  const { data: delRows, error } = await supabase
    .from('submissions')
    .delete()
    .eq('submission_id', id)
    .select('submission_id');
  if (error) throw new Error(error.message);
  const hadRow = (delRows?.length ?? 0) > 0;
  return hadRow || names.length > 0;
}

export async function submissionExistsInSupabase(id: string): Promise<boolean> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('submissions')
    .select('submission_id')
    .eq('submission_id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
