'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNav } from '@/hooks/useSectionNav';
import {
  SERVICE_PAGES,
  PHONE_DISPLAY,
  PHONE_HREF,
  EMAIL,
  AREAS,
  AREAS_EN,
  servicePath,
} from '@/lib/site';

const SECTION_LINKS = [
  { key: 'nav.why', id: 'why-us' },
  { key: 'nav.process', id: 'process' },
  { key: 'nav.gallery', id: 'gallery' },
  { key: 'nav.faq', id: 'faq' },
];

/** Titres de colonne : sans-serif explicite, sinon la règle de base des h3 impose Playfair. */
const COLUMN_TITLE =
  'font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground/50';

const Footer = () => {
  const { language, t } = useLanguage();
  const { hrefFor, handleClick } = useSectionNav();
  const areas = language === 'fr' ? AREAS : AREAS_EN;

  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="border-b border-white/10">
        <div className="container-custom flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center md:py-16">
          <div className="max-w-xl">
            <h2 className="h-section">{t('footer.quote')}</h2>
            <p className="mt-3 text-accent-foreground/75">{t('footer.cta.description')}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href={hrefFor('quote-form')}
              onClick={handleClick('quote-form')}
              className="btn-primary px-6 py-3.5 text-base"
            >
              {t('hero.cta.quote')}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
            <a href={PHONE_HREF} className="btn-ghost-light px-6 py-3.5 text-base">
              <Phone className="h-5 w-5" aria-hidden />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      <div className="container-custom py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div>
            <img
              src="/logofooter.svg"
              alt="TALON PLANCHER"
              width={1058}
              height={251}
              loading="lazy"
              className="mb-5 h-14 w-auto max-w-[220px] object-contain object-left"
            />
            <p className="max-w-xs text-sm leading-relaxed text-accent-foreground/70">
              {t('footer.brand.description')}
            </p>
          </div>

          <nav aria-label={t('nav.services')}>
            <h3 className={COLUMN_TITLE}>{t('nav.services')}</h3>
            <ul className="mt-4 space-y-2.5">
              {SERVICE_PAGES.map((service) => (
                <li key={service.key}>
                  <Link
                    href={servicePath(service, language)}
                    className="text-sm text-accent-foreground/75 transition-colors hover:text-accent-foreground"
                  >
                    {t(`services.${service.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.links')}>
            <h3 className={COLUMN_TITLE}>{t('footer.links')}</h3>
            <ul className="mt-4 space-y-2.5">
              {SECTION_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={hrefFor(link.id)}
                    onClick={handleClick(link.id)}
                    className="text-sm text-accent-foreground/75 transition-colors hover:text-accent-foreground"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className={COLUMN_TITLE}>{t('footer.contact')}</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={PHONE_HREF}
                  className="flex items-center gap-2.5 text-sm font-semibold transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent-foreground/50" aria-hidden />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2.5 break-all text-sm text-accent-foreground/75 transition-colors hover:text-accent-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent-foreground/50" aria-hidden />
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-accent-foreground/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground/50" aria-hidden />
                {areas.join(' · ')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          {/* L'année est figée au build (pages statiques) mais recalculée côté
              client : sans cette directive, tout visiteur arrivant après le
              1er janvier déclencherait une erreur d'hydratation. */}
          <p className="text-center text-sm text-accent-foreground/50" suppressHydrationWarning>
            © {new Date().getFullYear()} TALON PLANCHER. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
