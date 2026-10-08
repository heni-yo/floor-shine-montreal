'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHY_PHOTO } from '@/lib/photos';

const REASONS = ['quality', 'detail', 'timing', 'transparency', 'satisfaction', 'experience'];

const WhyUs = () => {
  const { language, t } = useLanguage();

  return (
    <section id="why-us" className="section bg-accent text-accent-foreground">
      <div className="container-custom grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* Une vraie photo de l'équipe au travail : plus parlant qu'une grille d'icônes */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white/5 sm:aspect-[4/3] lg:aspect-[4/5]">
          <Image
            src={WHY_PHOTO.src}
            alt={WHY_PHOTO.alt[language]}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="eyebrow text-white/60">{t('why.eyebrow')}</p>
          <h2 className="h-section mt-3">{t('why.title')}</h2>
          <p className="lead mt-4 text-accent-foreground/75">{t('why.subtitle')}</p>

          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {REASONS.map((key, index) => (
              <div key={key} className="border-t border-white/15 pt-5">
                <dt className="flex items-baseline gap-3">
                  <span className="text-xs font-semibold tabular-nums text-white/45">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-lg font-bold">{t(`why.${key}.title`)}</span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-accent-foreground/70">
                  {t(`why.${key}.description`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
