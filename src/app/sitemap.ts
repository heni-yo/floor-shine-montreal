import type { MetadataRoute } from 'next';
import { SERVICE_PAGES, SITE_URL, homePath, servicePath, type Lang } from '@/lib/site';
import { STAIN_PATHS } from '@/lib/stainColors';

const LANGS: Lang[] = ['fr', 'en'];

const sitemap = (): MetadataRoute.Sitemap => {
  const lastModified = new Date();

  return LANGS.flatMap((lang) => [
    {
      url: `${SITE_URL}${homePath(lang)}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: lang === 'fr' ? 1 : 0.9,
    },
    ...SERVICE_PAGES.map((service) => ({
      url: `${SITE_URL}${servicePath(service, lang)}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}${STAIN_PATHS[lang]}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]);
};

export default sitemap;
