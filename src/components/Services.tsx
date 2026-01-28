import { Layers, Footprints, Wrench, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();

  const scrollToForm = () => {
    const element = document.getElementById('quote-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const services = [
    {
      icon: Layers,
      titleKey: 'services.floor.title',
      descriptionKey: 'services.floor.description',
      benefitsKey: 'services.floor.benefits',
    },
    {
      icon: Footprints,
      titleKey: 'services.stairs.title',
      descriptionKey: 'services.stairs.description',
      benefitsKey: 'services.stairs.benefits',
    },
    {
      icon: Wrench,
      titleKey: 'services.repair.title',
      descriptionKey: 'services.repair.description',
      benefitsKey: 'services.repair.benefits',
    },
  ];

  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('services.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="card-wood group cursor-pointer"
              onClick={scrollToForm}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Title */}
              <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-4">
                {t(service.titleKey)}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {t(service.descriptionKey)}
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {t(service.benefitsKey).split(' • ').map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                {t('services.cta')}
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
