'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Check, Phone, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNav } from '@/hooks/useSectionNav';
import { SERVICE_COPY } from '@/lib/serviceContent';
import { SERVICE_PHOTOS } from '@/lib/photos';
import { PHONE_DISPLAY, PHONE_HREF, type ServiceKey } from '@/lib/site';

const ServiceIntro = ({ serviceKey }: { serviceKey: ServiceKey }) => {
  const { language, t } = useLanguage();
  const { home, hrefFor, handleClick } = useSectionNav();
  const copy = SERVICE_COPY[serviceKey][language];
  const photo = SERVICE_PHOTOS[serviceKey].hero;
  const benefits = t(`services.${serviceKey}.benefits`).split(' • ');

  return (
    <>
      {/* ---------- En-tête : titre + photo du service ---------- */}
      <section className="bg-surface pb-14 pt-24 md:pb-20 md:pt-32">
        <div className="container-custom">
          <nav aria-label={t('ui.breadcrumb')}>
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href={home} className="transition-colors hover:text-foreground">
                  {t('ui.home')}
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li aria-current="page" className="font-medium text-foreground">
                {t(`services.${serviceKey}.title`)}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <h1 className="h-display text-foreground">{copy.h1}</h1>
              <p className="lead prose-measure mt-6">{copy.lead}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={hrefFor('quote-form')}
                  onClick={handleClick('quote-form')}
                  className="btn-primary px-6 py-3.5 text-base"
                >
                  {t('services.cta')}
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </a>
                <a href={PHONE_HREF} className="btn-outline px-6 py-3.5 text-base">
                  <Phone className="h-5 w-5 text-primary" aria-hidden />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-strong shadow-lg lg:aspect-[4/5]">
              <Image
                src={photo.src}
                alt={photo.alt[language]}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Contenu rédactionnel + encadré collant ---------- */}
      <section className="section">
        <div className="container-custom grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="space-y-12">
            {copy.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-serif text-2xl font-bold text-foreground md:text-[1.75rem]">
                  {section.heading}
                </h2>
                <p className="prose-measure mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card bg-surface">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t(`services.${serviceKey}.title`)}
              </p>
              <ul className="mt-4 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
                <a
                  href={hrefFor('quote-form')}
                  onClick={handleClick('quote-form')}
                  className="btn-primary w-full"
                >
                  {t('services.cta')}
                </a>
                <a href={PHONE_HREF} className="btn-outline w-full">
                  <Phone className="h-4 w-4 text-primary" aria-hidden />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default ServiceIntro;
