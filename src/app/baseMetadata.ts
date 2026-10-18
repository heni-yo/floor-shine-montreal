import type { Metadata } from 'next';
import {
  HOME_META,
  SITE_NAME,
  SITE_URL,
  alternatesFor,
  servicePath,
  type Lang,
  type ServicePage,
} from '@/lib/site';
import { STAIN_PATHS } from '@/lib/stainColors';
import { translate } from '@/lib/translations';

/** Métadonnées d'une page service, dans une langue donnée. */
export const serviceMetadata = (service: ServicePage, lang: Lang): Metadata => {
  const path = servicePath(service, lang);

  return {
    title: service.metaTitle[lang],
    description: service.metaDescription[lang],
    alternates: { canonical: path, ...alternatesFor(service) },
    openGraph: {
      title: service.metaTitle[lang],
      description: service.metaDescription[lang],
      url: path,
    },
  };
};

/** Page des couleurs de teinture, avec son équivalent dans l'autre langue. */
export const stainColorsMetadata = (lang: Lang): Metadata => {
  const title = translate(lang, 'stains.metaTitle');
  const description = translate(lang, 'stains.metaDescription');
  const path = STAIN_PATHS[lang];

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { 'fr-CA': STAIN_PATHS.fr, 'en-CA': STAIN_PATHS.en, 'x-default': STAIN_PATHS.fr },
    },
    openGraph: { title, description, url: path },
  };
};

/** Métadonnées par défaut d'un layout racine, déclinées par langue. */
export const rootMetadata = (lang: Lang): Metadata => {
  const meta = HOME_META[lang];

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: meta.title, template: `%s | ${SITE_NAME}` },
    description: meta.description,
    authors: [{ name: SITE_NAME }],
    alternates: {
      canonical: lang === 'fr' ? '/' : '/en',
      ...alternatesFor(null),
    },
    openGraph: {
      type: 'website',
      locale: lang === 'fr' ? 'fr_CA' : 'en_CA',
      siteName: SITE_NAME,
      url: lang === 'fr' ? '/' : '/en',
      title: meta.title,
      description: meta.description,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/logo.png'],
    },
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    verification: { google: 'bHmmce_4w9f8rvyIRLrC3rGoG62mcIWuKuW8sp114MY' },
    other: { 'geo.region': 'CA-QC', 'geo.placename': 'Montréal' },
  };
};
