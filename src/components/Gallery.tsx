import { useLanguage } from '@/contexts/LanguageContext';

const Gallery = () => {
  const { t } = useLanguage();

  const galleryItems = [
    {
      before: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800',
      after: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
    },
    {
      before: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800',
      after: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
    },
    {
      before: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800',
      after: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800',
    },
    {
      before: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800',
      after: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=800',
    },
  ];

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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {galleryItems.map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg">
              {/* Before/After Container */}
              <div className="relative aspect-[4/3]">
                {/* After Image (Background) */}
                <img
                  src={item.after}
                  alt={`${t('gallery.after')} ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Before Image (Overlay on hover) */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={item.before}
                    alt={`${t('gallery.before')} ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0"
                  />
                </div>

                {/* Labels */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <span className="px-3 py-1 bg-foreground/80 text-background text-sm font-medium rounded-md opacity-100 group-hover:opacity-0 transition-opacity">
                    {t('gallery.before')}
                  </span>
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('gallery.after')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hint */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          {t('gallery.before')} → {t('gallery.after')} (hover/touch)
        </p>
      </div>
    </section>
  );
};

export default Gallery;
