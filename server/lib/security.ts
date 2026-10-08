import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';

/** Numéro de soumission tel que généré par le serveur : EST-2026-0001. */
const SUBMISSION_ID = /^EST-\d{4}-\d{4,6}$/;

/**
 * Nom de fichier tel que stocké par le serveur (« 1712345678-photo.jpg »,
 * « quote.xlsx »…) : caractères sûrs, pas de séparateur, pas de « .. ».
 */
const SAFE_FILENAME = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,199}$/;

export function isValidSubmissionId(id: unknown): id is string {
  return typeof id === 'string' && SUBMISSION_ID.test(id);
}

export function isSafeFilename(name: unknown): name is string {
  return (
    typeof name === 'string' &&
    SAFE_FILENAME.test(name) &&
    !name.includes('..') &&
    path.basename(name) === name
  );
}

/**
 * Joint des segments à une racine et refuse tout chemin qui en sortirait.
 * Seconde ligne de défense : les routes valident déjà id et nom de fichier.
 */
export function resolveInside(root: string, ...segments: string[]): string {
  const base = path.resolve(root);
  const target = path.resolve(base, ...segments);
  if (target !== base && !target.startsWith(base + path.sep)) {
    throw new Error('Chemin hors du dossier autorisé');
  }
  return target;
}

/** Retire les caractères de contrôle (retours de ligne compris) d'un texte destiné à un en-tête. */
export function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
}

/** Extensions d'images acceptées au téléversement (le type MIME seul est déclaré par le client). */
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']);

export function isAllowedImageUpload(originalName: string, mimetype: string): boolean {
  return mimetype.startsWith('image/') && IMAGE_EXTENSIONS.has(path.extname(originalName).toLowerCase());
}

type Bucket = { count: number; resetAt: number };

/**
 * Limiteur en mémoire par adresse IP, sans dépendance. Suffisant pour une
 * seule instance (cas de Render) ; les compteurs repartent à zéro au redémarrage.
 */
export function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  const buckets = new Map<string, Bucket>();

  // Purge périodique pour que la table ne grossisse pas indéfiniment.
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }, options.windowMs).unref();

  const keyOf = (req: Request) => req.ip || req.socket.remoteAddress || 'inconnu';

  const isBlocked = (req: Request): number => {
    const bucket = buckets.get(keyOf(req));
    if (!bucket || bucket.resetAt <= Date.now() || bucket.count < options.max) return 0;
    return Math.ceil((bucket.resetAt - Date.now()) / 1000);
  };

  const hit = (req: Request): void => {
    const key = keyOf(req);
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    } else {
      bucket.count += 1;
    }
  };

  const reject = (res: Response, retryAfter: number) => {
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: { message: options.message, code: 'RATE_LIMITED' } });
  };

  return {
    /** Compte chaque requête. */
    middleware(req: Request, res: Response, next: NextFunction): void {
      const retryAfter = isBlocked(req);
      if (retryAfter) return reject(res, retryAfter);
      hit(req);
      next();
    },
    /** Pour ne compter que les échecs (ex. jeton admin invalide). */
    isBlocked,
    hit,
    reject,
  };
}
