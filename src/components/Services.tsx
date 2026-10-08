'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SectionHeading from '@/components/SectionHeading';
import { SERVICE_PHOTOS } from '@/lib/photos';
import { SERVICE_PAGES, servicePath } from '@/lib/site';

const Services = () => {
  const { language, t } = useLanguage();

  return (
    <section id="services" className="section bg-background">
      <div className="container-custom">
        <SectionHeading
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          lead={t('services.subtitle')}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICE_PAGES.map((service) => {
            const photo = SERVICE_PHOTOS[service.key].cover;
            return (
              <Link
                key={service.key}
                href={servicePath(service, language)}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-200 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-surface-strong">
                  <Image
                    src={photo.src}
                    alt={photo.alt[language]}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                {/* flex-1 + mt-auto : le lien reste aligné en bas, quelle que soit la longueur du texte */}
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <h3 className="h-card text-foreground">{t(`services.${service.key}.title`)}</h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(`services.${service.key}.description`)}
                  </p>

                  <ul className="mt-5 space-y-2">
                    {t(`services.${service.key}.benefits`)
                      .split(' • ')
                      .map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                          {benefit}
                        </li>
                      ))}
                  </ul>

                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary">
                    {t('services.learnMore')}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
