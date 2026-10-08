'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNav } from '@/hooks/useSectionNav';
import { SERVICE_PAGES, PHONE_DISPLAY, PHONE_HREF, servicePath } from '@/lib/site';

const SECTION_ITEMS = [
  { key: 'nav.why', id: 'why-us' },
  { key: 'nav.process', id: 'process' },
  { key: 'nav.gallery', id: 'gallery' },
  { key: 'nav.faq', id: 'faq' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, t } = useLanguage();
  const { home, hrefFor, handleClick, scrollToTop, switchLangHref } = useSectionNav();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-background transition-shadow duration-200 ${
        isScrolled ? 'border-border shadow-sm' : 'border-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Link
            href={home}
            onClick={(e) => {
              scrollToTop(e);
              close();
            }}
            className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Talon Plancher"
          >
            <img
              src="/logoNav.svg"
              alt="Talon Plancher"
              width={1058}
              height={251}
              className="h-11 w-auto max-w-[220px] object-contain object-left md:h-12"
            />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden items-center gap-7 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsServicesOpen((open) => !open)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={isServicesOpen}
              >
                {t('nav.services')}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isServicesOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
              {isServicesOpen && (
                <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4">
                  <ul className="overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                    {SERVICE_PAGES.map((service) => (
                      <li key={service.key}>
                        <Link
                          href={servicePath(service, language)}
                          onClick={close}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                        >
                          {t(`services.${service.key}.title`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {SECTION_ITEMS.map((item) => (
              <a
                key={item.id}
                href={hrefFor(item.id)}
                onClick={handleClick(item.id)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href={switchLangHref}
              aria-label={t('ui.switchLangAria')}
              className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </Link>

            <a
              href={PHONE_HREF}
              className="hidden items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary md:flex"
            >
              <Phone className="h-4 w-4 text-primary" aria-hidden />
              {PHONE_DISPLAY}
            </a>

            <a
              href={hrefFor('quote-form')}
              onClick={handleClick('quote-form')}
              className="btn-primary hidden md:inline-flex"
            >
              {t('nav.quote')}
            </a>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground lg:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
            >
              {isMenuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="animate-fade-in border-t border-border bg-background lg:hidden"
        >
          <nav className="container-custom flex flex-col py-5">
            <span className="pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('nav.services')}
            </span>
            {SERVICE_PAGES.map((service) => (
              <Link
                key={service.key}
                href={servicePath(service, language)}
                onClick={close}
                className="border-b border-border py-3 font-medium text-foreground last:border-0"
              >
                {t(`services.${service.key}.title`)}
              </Link>
            ))}

            <div className="mt-5 flex flex-col border-t border-border pt-3">
              {SECTION_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={hrefFor(item.id)}
                  onClick={(e) => {
                    handleClick(item.id)(e);
                    close();
                  }}
                  className="py-3 text-muted-foreground"
                >
                  {t(item.key)}
                </a>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-5">
              <a href={PHONE_HREF} className="flex items-center gap-2 font-semibold text-foreground">
                <Phone className="h-4 w-4 text-primary" aria-hidden />
                {PHONE_DISPLAY}
              </a>
              <a
                href={hrefFor('quote-form')}
                onClick={(e) => {
                  handleClick('quote-form')(e);
                  close();
                }}
                className="btn-primary w-full"
              >
                {t('nav.quote')}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
