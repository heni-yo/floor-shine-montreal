import { Award, Eye, Clock, FileText, ThumbsUp, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WhyUs = () => {
  const { t } = useLanguage();

  const reasons = [
    { icon: Award, titleKey: 'why.quality.title', descriptionKey: 'why.quality.description' },
    { icon: Eye, titleKey: 'why.detail.title', descriptionKey: 'why.detail.description' },
    { icon: Clock, titleKey: 'why.timing.title', descriptionKey: 'why.timing.description' },
    { icon: FileText, titleKey: 'why.transparency.title', descriptionKey: 'why.transparency.description' },
    { icon: ThumbsUp, titleKey: 'why.satisfaction.title', descriptionKey: 'why.satisfaction.description' },
    { icon: Star, titleKey: 'why.experience.title', descriptionKey: 'why.experience.description' },
  ];

  return (
    <section id="why-us" className="section-padding bg-accent text-accent-foreground">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('why.title')}
          </h2>
          <p className="text-accent-foreground/90 text-lg max-w-2xl mx-auto">
            {t('why.subtitle')}
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-accent-foreground/5 hover:bg-accent-foreground/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <reason.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">
                {t(reason.titleKey)}
              </h3>
              <p className="text-accent-foreground/90">
                {t(reason.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
