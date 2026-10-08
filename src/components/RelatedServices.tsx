'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICE_PHOTOS } from '@/lib/photos';
import { SERVICE_PAGES, servicePath, type ServiceKey } from '@/lib/site';

const RelatedServices = ({ current }: { current: ServiceKey }) => {
  const { language, t } = useLanguage();
  const related = SERVICE_PAGES.filter((service) => service.key !== current);

  return (
    <section className="section-tight pb-16 md:pb-24">
      <div className="container-custom">
        <h2 className="h-section mb-8 text-foreground">{t('service.related.title')}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {related.map((service) => {
            const photo = SERVICE_PHOTOS[service.key].cover;
            return (
              <li key={service.key}>
                <Link
                  href={servicePath(service, language)}
                  className="group flex items-center gap-5 overflow-hidden rounded-xl border border-border bg-card p-3 pr-6 transition-colors hover:border-border-strong hover:bg-surface"
                >
                  <span className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-strong sm:h-28 sm:w-32">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="h-card block text-foreground">
                      {t(`services.${service.key}.title`)}
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-sm text-muted-foreground">
                      {t(`services.${service.key}.description`)}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default RelatedServices;
