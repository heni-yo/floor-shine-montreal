import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { SERVER_DATA_DIR, UPLOAD_ROOT } from '../paths.js';

const DB_PATH =
  process.env.SUBMISSIONS_DB_PATH?.trim() || path.join(SERVER_DATA_DIR, 'submissions.sqlite');

export interface SubmissionMeta {
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

let db: Database.Database | null = null;

export function getSubmissionsDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(SERVER_DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        submission_id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        services_json TEXT NOT NULL,
        photos_json TEXT NOT NULL
      );
    `);
  }
  return db;
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
  services_json: string;
  photos_json: string;
}): SubmissionMeta {
  return {
    submissionId: row.submission_id,
    createdAt: row.created_at,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    postalCode: row.postal_code,
    services: JSON.parse(row.services_json) as Record<string, unknown>,
    photos: JSON.parse(row.photos_json) as string[],
  };
}

export function listSubmissionsFromDb(): SubmissionMeta[] {
  const d = getSubmissionsDb();
  const rows = d
    .prepare(
      `SELECT submission_id, created_at, first_name, last_name, email, phone, city, postal_code, services_json, photos_json
       FROM submissions ORDER BY datetime(created_at) DESC`,
    )
    .all() as Array<{
      submission_id: string;
      created_at: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      city: string;
      postal_code: string;
      services_json: string;
      photos_json: string;
    }>;
  return rows.map(rowToMeta);
}

export function insertSubmission(meta: SubmissionMeta): void {
  const d = getSubmissionsDb();
  d.prepare(
    `INSERT INTO submissions (submission_id, created_at, first_name, last_name, email, phone, city, postal_code, services_json, photos_json)
     VALUES (@submission_id, @created_at, @first_name, @last_name, @email, @phone, @city, @postal_code, @services_json, @photos_json)`,
  ).run({
    submission_id: meta.submissionId,
    created_at: meta.createdAt,
    first_name: meta.firstName,
    last_name: meta.lastName,
    email: meta.email,
    phone: meta.phone,
    city: meta.city,
    postal_code: meta.postalCode,
    services_json: JSON.stringify(meta.services),
    photos_json: JSON.stringify(meta.photos),
  });
}

export function deleteSubmissionRow(submissionId: string): void {
  getSubmissionsDb().prepare('DELETE FROM submissions WHERE submission_id = ?').run(submissionId);
}

/** Reprend les meta.json déjà sur disque (migration ou dossiers créés avant la base). */
export function migrateSubmissionsFromDisk(): void {
  if (!fs.existsSync(UPLOAD_ROOT)) return;
  const d = getSubmissionsDb();
  const insert = d.prepare(
    `INSERT OR IGNORE INTO submissions (submission_id, created_at, first_name, last_name, email, phone, city, postal_code, services_json, photos_json)
     VALUES (@submission_id, @created_at, @first_name, @last_name, @email, @phone, @city, @postal_code, @services_json, @photos_json)`,
  );
  let dirs: string[] = [];
  try {
    dirs = fs.readdirSync(UPLOAD_ROOT).filter((name) => name.startsWith('EST-'));
  } catch {
    return;
  }
  const migrate = d.transaction(() => {
    for (const dir of dirs) {
      const metaPath = path.join(UPLOAD_ROOT, dir, 'meta.json');
      if (!fs.existsSync(metaPath)) continue;
      try {
        const raw = fs.readFileSync(metaPath, 'utf8');
        const meta = JSON.parse(raw) as SubmissionMeta;
        if (!meta.submissionId || !meta.createdAt) continue;
        insert.run({
          submission_id: meta.submissionId,
          created_at: meta.createdAt,
          first_name: meta.firstName,
          last_name: meta.lastName,
          email: meta.email,
          phone: meta.phone,
          city: meta.city,
          postal_code: meta.postalCode,
          services_json: JSON.stringify(meta.services ?? {}),
          photos_json: JSON.stringify(meta.photos ?? []),
        });
      } catch {
        /* meta illisible */
      }
    }
  });
  migrate();
}
