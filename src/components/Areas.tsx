import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Areas = () => {
  const { t } = useLanguage();

  const areas = [
    { name: 'Montréal' },
    { name: 'Rive-Sud' },
    { name: 'Rive-Nord' },
  ];

  return (
    <section id="areas" className="section-padding bg-secondary">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('areas.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('areas.description')}
          </p>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {areas.map((area, index) => (
            <div key={index} className="card-wood text-center">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {area.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Areas;
