import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Areas = () => {
  const { t } = useLanguage();

  const areas = [
    { name: 'Montréal', neighborhoods: ['Plateau', 'Rosemont', 'Hochelaga', 'Villeray', 'NDG', 'Verdun', 'LaSalle', 'Ahuntsic'] },
    { name: 'Laval', neighborhoods: ['Chomedey', 'Sainte-Rose', 'Vimont', 'Duvernay', 'Fabreville'] },
    { name: 'Rive-Sud', neighborhoods: ['Longueuil', 'Brossard', 'Saint-Lambert', 'Boucherville', 'La Prairie'] },
    { name: 'Rive-Nord', neighborhoods: ['Terrebonne', 'Repentigny', 'Mascouche', 'Blainville', 'Boisbriand'] },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, index) => (
            <div key={index} className="card-wood">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {area.name}
                </h3>
              </div>
              <ul className="space-y-2">
                {area.neighborhoods.map((neighborhood, i) => (
                  <li key={i} className="text-muted-foreground text-sm flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {neighborhood}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Areas;
