'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNav } from '@/hooks/useSectionNav';
import { SERVICE_PHOTOS } from '@/lib/photos';
import type { ServiceKey } from '@/lib/site';

/** 4 photos choisies pour le service — la page escalier montre des escaliers. */
const GalleryTeaser = ({ serviceKey }: { serviceKey: ServiceKey }) => {
  const { language, t } = useLanguage();
  const { home } = useSectionNav();
  const photos = SERVICE_PHOTOS[serviceKey].teaser;

  return (
    <section className="section-tight">
      <div className="container-custom">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section text-foreground">{t('service.gallery.title')}</h2>
          <Link
            href={`${home}#gallery`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {t('service.gallery.viewAll')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {photos.map((photo) => (
            <li key={photo.src} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-strong">
              <Image
                src={photo.src}
                alt={photo.alt[language]}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default GalleryTeaser;
