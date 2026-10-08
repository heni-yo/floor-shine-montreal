'use client';

import { ClipboardCheck, Shield, Disc, Paintbrush, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SectionHeading from '@/components/SectionHeading';

const STEPS = [
  { icon: ClipboardCheck, step: 1 },
  { icon: Shield, step: 2 },
  { icon: Disc, step: 3 },
  { icon: Paintbrush, step: 4 },
  { icon: CheckCircle, step: 5 },
];

const Process = () => {
  const { t } = useLanguage();

  return (
    <section id="process" className="section bg-surface">
      <div className="container-custom">
        <SectionHeading
          eyebrow={t('process.eyebrow')}
          title={t('process.title')}
          lead={t('process.subtitle')}
        />

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {STEPS.map(({ icon: Icon, step }) => (
            <li key={step} className="relative">
              {/* Filet de liaison entre les étapes (desktop) */}
              <span
                className="absolute left-11 right-0 top-5 hidden h-px bg-border lg:block"
                aria-hidden
              />

              <div className="relative flex items-center gap-3">
                <span className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="h-[18px] w-[18px] text-primary" aria-hidden />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {String(step).padStart(2, '0')}
                </span>
              </div>

              <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                {t(`process.step${step}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`process.step${step}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Process;
