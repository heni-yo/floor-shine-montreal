import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

const images = [
  '/img/IMG_0108.jpg',
  '/img/IMG_0518.jpg',
  '/img/IMG_0522.jpg',
  '/img/IMG_0689.jpg',
  '/img/IMG_1200.jpg',
  '/img/IMG_1266.jpg',
  '/img/IMG_1536.jpg',
  '/img/IMG_1688.jpg',
  '/img/IMG_2525.jpg',
  '/img/IMG_3799.jpg',
  '/img/IMG_3816.jpg',
  '/img/IMG_7166.jpg',
  '/img/IMG_7221.jpg',
  '/img/IMG_7227.jpg',
  '/img/IMG_7896.jpg',
  '/img/IMG_9029.jpg',
  '/img/IMG_9033.jpg',
  '/img/231dbf24-3148-4628-826b-eba9c48d90f3.jpg',
  '/img/3b974c5a-ecd9-4525-9207-5c43c6726e74.jpg',
  '/img/5672a966-d1b0-47e9-b6e5-afa6de936a7c.jpg',
  '/img/b9b23967-ef82-44d8-9faa-7d0e535bf409.jpg',
];

const Gallery = () => {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1 },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = () => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  const lightboxNext = () => setLightboxIndex((prev) => (prev + 1) % images.length);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [lightboxOpen]);

  // Dot indicators - show groups
  const totalDots = images.length;
  const visibleDots = 7;
  const startDot = Math.max(0, Math.min(selectedIndex - Math.floor(visibleDots / 2), totalDots - visibleDots));
  const dotsToShow = Array.from({ length: Math.min(visibleDots, totalDots) }, (_, i) => startDot + i);

  return (
    <section id="gallery" className="section-padding bg-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('gallery.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative group">
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
            <div className="flex">
              {images.map((src, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2"
                >
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group/item"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={src}
                      alt={`Sablage de plancher Montréal – Réalisation TALON PLANCHER ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover/item:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-background opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {dotsToShow.map((dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => emblaApi?.scrollTo(dotIndex)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                dotIndex === selectedIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-10 gap-2 mt-8">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => {
                emblaApi?.scrollTo(index);
                openLightbox(index);
              }}
              className={cn(
                'aspect-square rounded-md overflow-hidden border-2 transition-all duration-200',
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-primary/50 opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={src}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={`${t('gallery.title')} ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Lightbox Navigation */}
          <button
            onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
