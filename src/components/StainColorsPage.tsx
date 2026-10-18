'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, ExternalLink, Info } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileCta from '@/components/MobileCta';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNav } from '@/hooks/useSectionNav';
import { STAIN_SAMPLE_PHOTOS } from '@/lib/photos';
import {
  DURASEAL_GALLERY_URL,
  STAIN_COLORS,
  STAIN_FAMILIES,
  luminance,
  swatchBackground,
  type Species,
  type StainFamily,
} from '@/lib/stainColors';

const SPECIES: Species[] = ['redOak', 'whiteOak'];

const chip = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    active
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground'
  }`;

const StainColorsPage = () => {
  const { language, t } = useLanguage();
  const { home } = useSectionNav();
  // Chêne rouge par défaut : c'est le plancher le plus répandu au Québec.
  const [species, setSpecies] = useState<Species>('redOak');
  const [family, setFamily] = useState<StainFamily | 'all'>('all');

  /** Par famille, de la plus pâle à la plus foncée sur l'essence choisie. */
  const groups = useMemo(
    () =>
      STAIN_FAMILIES.filter((f) => family === 'all' || f === family).map((f) => ({
        family: f,
        colors: STAIN_COLORS.filter((c) => c.family === f && c.tones[species])
          .map((c) => ({ name: c.name, tones: c.tones[species]! }))
          .sort((a, b) => luminance(b.tones[0]) - luminance(a.tones[0])),
      })),
    [species, family],
  );
  const count = groups.reduce((n, g) => n + g.colors.length, 0);
  const familyCount = (f: StainFamily) => STAIN_COLORS.filter((c) => c.family === f && c.tones[species]).length;

  return (
    <>
      <Header />
      <main className="pb-16 lg:pb-0">
        <section className="bg-surface pb-12 pt-24 md:pb-16 md:pt-32">
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
                  {t('nav.stains')}
                </li>
              </ol>
            </nav>

            <div className="mt-8 max-w-3xl">
              <p className="eyebrow">{t('stains.eyebrow')}</p>
              <h1 className="h-display mt-3 text-foreground">{t('stains.title')}</h1>
              <p className="lead prose-measure mt-6">{t('stains.lead')}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`${home}#quote-form`} className="btn-primary px-6 py-3.5 text-base">
                  {t('stains.cta')}
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <a
                  href={DURASEAL_GALLERY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline px-6 py-3.5 text-base"
                >
                  {t('stains.official')}
                  <ExternalLink className="h-4 w-4 text-primary" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container-custom">
            {/* Choix de l'essence, puis filtre par famille de couleurs */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{t('stains.species')}</p>
                <div
                  role="group"
                  aria-label={t('stains.species')}
                  className="mt-2 inline-flex rounded-lg border border-border bg-surface p-1"
                >
                  {SPECIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpecies(s)}
                      aria-pressed={species === s}
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        species === s
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`stains.species.${s}`)}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t('stains.speciesHint')}</p>
              </div>

              <div role="group" aria-label={t('stains.filter')} className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setFamily('all')} aria-pressed={family === 'all'} className={chip(family === 'all')}>
                  {t('stains.family.all')}
                </button>
                {STAIN_FAMILIES.map((f) => (
                  <button key={f} type="button" onClick={() => setFamily(f)} aria-pressed={family === f} className={chip(family === f)}>
                    {t(`stains.family.${f}`)}
                    <span className="ml-1.5 tabular-nums opacity-60">{familyCount(f)}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
              {count} {t('stains.colors')} · {t(`stains.species.${species}`)}
            </p>

            <div className="mt-4 space-y-12">
              {groups.map((g) => (
                <div key={g.family}>
                  {family === 'all' && (
                    <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t(`stains.family.${g.family}`)}
                    </h2>
                  )}
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {g.colors.map((c) => (
                      <li key={c.name}>
                        <div
                          aria-hidden
                          className="aspect-square w-full rounded-lg shadow-sm ring-1 ring-black/10"
                          style={{ backgroundImage: swatchBackground(c.tones), backgroundColor: c.tones[0] }}
                        />
                        <p className="mt-2.5 text-sm font-semibold text-foreground">{c.name}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <aside className="mt-12 rounded-xl border border-border bg-surface p-5 sm:p-6">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <Info className="h-4 w-4 text-primary" aria-hidden />
                {t('stains.notice.title')}
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground marker:text-border-strong">
                <li>{t('stains.notice.screen')}</li>
                <li>{t('stains.notice.maple')}</li>
                <li>{t('stains.notice.samples')}</li>
              </ul>
              <a
                href={DURASEAL_GALLERY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {t('stains.official')}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <p className="mt-1 text-xs text-muted-foreground">{t('stains.officialHint')}</p>
            </aside>
          </div>
        </section>

        <section className="section bg-surface">
          <div className="container-custom grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="grid grid-cols-2 gap-3">
              {STAIN_SAMPLE_PHOTOS.map((photo) => (
                <div key={photo.src} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-strong">
                  <Image
                    src={photo.src}
                    alt={photo.alt[language]}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <h2 className="h-section text-foreground">{t('stains.samples.title')}</h2>
              <p className="lead mt-4">{t('stains.samples.body')}</p>
              <Link href={`${home}#quote-form`} className="btn-primary mt-8 px-6 py-3.5 text-base">
                {t('stains.cta')}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileCta />
    </>
  );
};

export default StainColorsPage;
