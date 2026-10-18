'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SectionHeading from '@/components/SectionHeading';
import { BEFORE_AFTER, GALLERY as photos, type Photo } from '@/lib/photos';

/** Tailles réelles d'affichage : évite de télécharger du 2048 px pour une tuile. */
const SLIDE_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
const PAIR_SIZES = '(min-width: 768px) 25vw, 50vw';

/** La visionneuse parcourt soit la galerie, soit une paire avant / après. */
type Lightbox = { items: Photo[]; index: number };

const Gallery = () => {
  const { language, t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const isOpen = lightbox !== null;
  const step = useCallback(
    (delta: number) =>
      setLightbox((l) => (l ? { ...l, index: (l.index + delta + l.items.length) % l.items.length } : l)),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [isOpen, step]);

  const navButton =
    'absolute top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <section id="gallery" className="section bg-background">
      <div className="container-custom">
        <SectionHeading
          eyebrow={t('gallery.eyebrow')}
          title={t('gallery.title')}
          lead={t('gallery.subtitle')}
        />

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-4 flex">
              {photos.map((photo, index) => (
                <div
                  key={photo.src}
                  className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <button
                    type="button"
                    onClick={() => setLightbox({ items: photos, index })}
                    className="group relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`${t('gallery.aria.open')} : ${photo.alt[language]}`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt[language]}
                      fill
                      sizes={SLIDE_SIZES}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                    <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Expand className="h-4 w-4 text-white" aria-hidden />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Flèches visibles en permanence sur desktop, pour signaler que la galerie défile */}
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className={`${navButton} -left-5 hidden md:inline-flex`}
            aria-label={t('gallery.aria.prev')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className={`${navButton} -right-5 hidden md:inline-flex`}
            aria-label={t('gallery.aria.next')}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div
          className="mt-8 flex justify-center gap-1.5"
          role="group"
          aria-label={t('gallery.carouselLabel')}
        >
          {photos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className="inline-flex h-8 items-center justify-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${t('gallery.aria.slideNav')} ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? 'w-6 bg-primary' : 'w-1.5 bg-border-strong'
                }`}
                aria-hidden
              />
            </button>
          ))}
        </div>

        {/* Avant / après : même pièce, deux moments du chantier */}
        <div className="mt-16 md:mt-20">
          <h3 className="h-card text-2xl text-foreground md:text-3xl">{t('gallery.beforeAfter.title')}</h3>
          <p className="mt-2 text-muted-foreground">{t('gallery.beforeAfter.subtitle')}</p>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {BEFORE_AFTER.map((pair) => (
              <li key={pair.before.src}>
                <figure>
                  <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-xl">
                    {([
                      [pair.before, t('gallery.before')],
                      [pair.after, t('gallery.after')],
                    ] as const).map(([photo, label], index) => (
                      <button
                        key={photo.src}
                        type="button"
                        onClick={() => setLightbox({ items: [pair.before, pair.after], index })}
                        className="group relative block aspect-square w-full overflow-hidden bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        aria-label={`${t('gallery.aria.open')} : ${photo.alt[language]}`}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt[language]}
                          fill
                          sizes={PAIR_SIZES}
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <span
                          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                            index === 0 ? 'bg-black/60 text-white backdrop-blur-sm' : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <figcaption className="mt-3 text-sm font-medium text-foreground">{pair.caption[language]}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isOpen && lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.items[lightbox.index].alt[language]}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={t('gallery.aria.close')}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <span className="absolute left-5 top-6 text-sm font-medium tabular-nums text-white/60">
            {lightbox.index + 1} / {lightbox.items.length}
          </span>

          <figure className="flex w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[78vh] w-full">
              <Image
                src={lightbox.items[lightbox.index].src}
                alt={lightbox.items[lightbox.index].alt[language]}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center text-sm text-white/70">
              {lightbox.items[lightbox.index].alt[language]}
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={t('gallery.aria.prev')}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={t('gallery.aria.next')}
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
