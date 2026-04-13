import { timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

function readBearerToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string') return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Jeton long (ex. 32+ caractères aléatoires) dans les variables d'environnement du serveur. */
export function getExpectedAdminToken(): string | null {
  const t = process.env.ADMIN_API_TOKEN?.trim();
  return t && t.length >= 16 ? t : null;
}

export function isAdminAuthorized(req: Request): boolean {
  const expected = getExpectedAdminToken();
  if (!expected) return false;
  const got = readBearerToken(req);
  if (!got) return false;
  return timingSafeStringEqual(got, expected);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!getExpectedAdminToken()) {
    res.status(503).json({
      error: 'Configuration serveur incomplète : définissez ADMIN_API_TOKEN (secret fort, jamais dans le front).',
    });
    return;
  }
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ error: 'Non autorisé.' });
    return;
  }
  next();
}
