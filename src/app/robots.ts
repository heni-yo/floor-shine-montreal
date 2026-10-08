import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * La page d'administration n'est volontairement PAS listée ici : robots.txt
 * est public, et y écrire « Disallow: /history123 » revenait à publier son
 * adresse. Elle est exclue des moteurs par sa balise meta noindex.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: [{ userAgent: '*', allow: '/' }],
  sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
