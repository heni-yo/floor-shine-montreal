'use client';

import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AREAS, AREAS_EN } from '@/lib/site';

/** Bandeau compact : un libellé, puis la liste — sans répéter la même phrase deux fois. */
const Areas = () => {
  const { language, t } = useLanguage();
  const areas = language === 'fr' ? AREAS : AREAS_EN;

  return (
    <section id="areas" aria-label={t('areas.strip')} className="border-y border-border bg-surface py-6">
      <div className="container-custom flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          {t('areas.strip')}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-2 text-sm font-semibold text-foreground">
          {areas.map((area, index) => (
            <li key={area} className="flex items-center gap-2">
              {index > 0 && <span className="text-border-strong" aria-hidden>·</span>}
              {area}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Areas;
