import type { NextConfig } from 'next';

const API_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:3001';

// 'unsafe-inline' est requis pour les scripts inline que Next injecte (payload RSC).
// L'alternative (nonce via middleware) forcerait le rendu dynamique de toutes les
// pages et supprimerait la génération statique, qui est l'intérêt de cette migration.
const isDev = process.env.NODE_ENV !== 'production';

/**
 * URL de l'API Render. Repli sur VITE_API_URL : c'est le nom que portait la
 * variable du temps de Vite, et elle existe déjà sur Vercel — sans ce repli,
 * le formulaire casserait en production tant que la variable n'est pas renommée.
 */
const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || '').trim();

/** Origine de l'API, pour restreindre connect-src. */
const API_ORIGIN = (() => {
  try {
    return PUBLIC_API_URL ? new URL(PUBLIC_API_URL).origin : null;
  } catch {
    return null;
  }
})();

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  // Service worker de la page admin (/history123, installation PWA).
  "worker-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // 'unsafe-eval' seulement en dev : le HMR de Next évalue du code à la volée.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Seule l'API du formulaire est appelée : plutôt que « tout https », on
  // n'autorise que son origine quand elle est connue au build.
  `connect-src 'self' ${API_ORIGIN ?? 'https:'}${isDev ? ' ws: http:' : ''}`,
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
  // Les composants shadcn générés dans src/components/ui déclenchent des erreurs
  // de lint préexistantes. Le lint reste lancé séparément via `npm run lint`.
  eslint: { ignoreDuringBuilds: true },

  // Injecte l'URL résolue ci-dessus dans le code client (formulaire, historique).
  env: { NEXT_PUBLIC_API_URL: PUBLIC_API_URL },

  // Avec deux layouts racine (fr)/(en), une URL inconnue n'appartient à aucun
  // des deux : sans page 404 globale, Next affiche sa page générique en anglais.
  experimental: { globalNotFound: true },

  images: {
    // Par défaut Next ne sert que du WebP ; l'AVIF est sensiblement plus léger.
    formats: ['image/avif', 'image/webp'],
    // L'optimiseur ne traite que les photos du site, et seulement aux qualités
    // utilisées : un tiers ne peut pas lui faire décoder d'autres fichiers ni
    // multiplier les variantes pour saturer le cache et le processeur.
    localPatterns: [{ pathname: '/img/**', search: '' }],
    qualities: [75, 80],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ];
  },

  // En local, reproduit le proxy Vite vers l'API Express. En production
  // NEXT_PUBLIC_API_URL pointe directement vers le backend déployé, donc les
  // requêtes ne passent jamais par ce rewrite.
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    return [{ source: '/api/:path*', destination: `${API_TARGET}/api/:path*` }];
  },
};

export default nextConfig;
