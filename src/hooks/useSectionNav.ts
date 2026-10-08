'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICE_PAGES, homePath, servicePath } from '@/lib/site';

/**
 * L'accueil et les pages service rendent les mêmes ancres (#faq, #quote-form…).
 * On scrolle donc sur place quand la cible existe, et on retombe sur l'accueil
 * de la langue courante sinon.
 */
export const useSectionNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();

  const home = homePath(language);

  const hrefFor = (id: string) => `#${id}`;

  const handleClick = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    router.push(`${home}#${id}`);
  };

  const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== home) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** URL équivalente dans l'autre langue, pour le sélecteur FR/EN. */
  const otherLang = language === 'fr' ? 'en' : 'fr';
  const match = SERVICE_PAGES.find(
    (service) => pathname === servicePath(service, language),
  );
  const switchLangHref = match
    ? servicePath(match, otherLang)
    : homePath(otherLang);

  return { home, hrefFor, handleClick, scrollToTop, switchLangHref, otherLang };
};
