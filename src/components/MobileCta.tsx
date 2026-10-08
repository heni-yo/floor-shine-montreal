'use client';

import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNav } from '@/hooks/useSectionNav';
import { PHONE_HREF } from '@/lib/site';

/**
 * Barre d'action fixe, mobile uniquement : sur ordinateur le bouton de
 * l'en-tête reste visible en permanence, celui-ci ferait doublon.
 * Apparaît une fois le hero dépassé pour ne pas concurrencer ses propres CTA.
 */
const MobileCta = () => {
  const { t } = useLanguage();
  const { hrefFor, handleClick } = useSectionNav();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md transition-transform duration-300 lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      /* Retiré du parcours clavier tant qu'il est masqué */
      aria-hidden={!visible}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <a
          href={PHONE_HREF}
          tabIndex={visible ? 0 : -1}
          className="btn-outline shrink-0 px-4"
          aria-label={t('hero.cta.call')}
        >
          <Phone className="h-5 w-5 text-primary" aria-hidden />
        </a>
        <a
          href={hrefFor('quote-form')}
          onClick={handleClick('quote-form')}
          tabIndex={visible ? 0 : -1}
          className="btn-primary flex-1"
        >
          {t('nav.quote')}
        </a>
      </div>
    </div>
  );
};

export default MobileCta;
