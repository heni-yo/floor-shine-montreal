'use client';

import { useState } from 'react';
import { Plus, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PHONE_DISPLAY, PHONE_HREF } from '@/lib/site';

const ALL_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8'];

/**
 * `keys` permet aux pages service de n'afficher que les questions pertinentes
 * plutôt que de dupliquer la FAQ complète de l'accueil.
 */
const FAQ = ({
  keys = ALL_KEYS,
  heading,
  compact = false,
}: {
  keys?: string[];
  heading?: string;
  compact?: boolean;
}) => {
  const { t } = useLanguage();
  const [openKey, setOpenKey] = useState<string | null>(keys[0] ?? null);

  const list = (
    <dl className="divide-y divide-border border-y border-border">
      {keys.map((key) => {
        const isOpen = openKey === key;
        return (
          <div key={key}>
            <dt>
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${key}`}
                className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-primary"
              >
                <span className="font-medium text-foreground">{t(`faq.q${key}`)}</span>
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                    isOpen ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
                  }`}
                >
                  <Plus
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                    aria-hidden
                  />
                </span>
              </button>
            </dt>
            <dd
              id={`faq-answer-${key}`}
              hidden={!isOpen}
              className="prose-measure -mt-1 pb-6 pr-12 leading-relaxed text-muted-foreground"
            >
              {t(`faq.a${key}`)}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  if (compact) {
    return (
      <section id="faq" className="section-tight">
        <div className="container-custom">
          <h2 className="h-section mb-8 text-foreground">{heading ?? t('faq.title')}</h2>
          {list}
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="section bg-background">
      <div className="container-custom grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{t('faq.eyebrow')}</p>
          <h2 className="h-section mt-3 text-foreground">{heading ?? t('faq.title')}</h2>
          <p className="lead mt-4">{t('faq.subtitle')}</p>

          <div className="mt-8 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-medium text-foreground">{t('faq.contact')}</p>
            <a
              href={PHONE_HREF}
              className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline"
            >
              <Phone className="h-5 w-5" aria-hidden />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>

        {list}
      </div>
    </section>
  );
};

export default FAQ;
