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
