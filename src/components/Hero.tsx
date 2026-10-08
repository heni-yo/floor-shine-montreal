'use client';

import Image from 'next/image';
import { ArrowRight, Phone, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionNav } from '@/hooks/useSectionNav';
import { HERO_PHOTO } from '@/lib/photos';
import { PHONE_DISPLAY, PHONE_HREF } from '@/lib/site';

const TRUST = ['hero.trust.quote', 'hero.trust.guarantee', 'hero.trust.equipment'];

const Hero = () => {
  const { language, t } = useLanguage();
  const { hrefFor, handleClick } = useSectionNav();

  return (
    <section className="relative isolate flex min-h-[88svh] items-center overflow-hidden pt-16 md:pt-20">
      {/* Photo d'un vrai chantier. priority = préchargée, c'est l'élément LCP. */}
      <Image
        src={HERO_PHOTO.src}
        alt={HERO_PHOTO.alt[language]}
        fill
        priority
        sizes="100vw"
        quality={80}
        className="-z-20 object-cover object-[55%_38%]"
      />
      {/* Dégradé pondéré à gauche : le texte reste lisible, la photo respire */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(95deg, hsl(24 30% 7% / 0.92) 0%, hsl(24 30% 7% / 0.78) 38%, hsl(24 30% 7% / 0.35) 70%, hsl(24 30% 7% / 0.15) 100%)',
        }}
        aria-hidden
      />

      <div className="container-custom py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            {t('hero.subtitle')}
          </p>

          <h1
            className="h-display animate-fade-up mt-5 text-white"
            style={{ animationDelay: '60ms' }}
          >
            {t('hero.title')}
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-white/85"
            style={{ animationDelay: '120ms' }}
          >
            {t('hero.description')}
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '180ms' }}
          >
            <a
              href={hrefFor('quote-form')}
              onClick={handleClick('quote-form')}
              className="btn-primary px-7 py-3.5 text-base"
            >
              {t('hero.cta.quote')}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </a>

            <a href={PHONE_HREF} className="btn-ghost-light px-7 py-3.5 text-base">
              <Phone className="h-5 w-5" aria-hidden />
              {PHONE_DISPLAY}
            </a>
          </div>

          <ul
            className="animate-fade-up mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/15 pt-6"
            style={{ animationDelay: '240ms' }}
          >
            {TRUST.map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm font-medium text-white/85">
                <Check className="h-4 w-4 shrink-0 text-white" aria-hidden />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Hero;
