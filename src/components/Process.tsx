import { ClipboardCheck, Shield, Disc, Paintbrush, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Process = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: ClipboardCheck, titleKey: 'process.step1.title', descriptionKey: 'process.step1.description', number: '01' },
    { icon: Shield, titleKey: 'process.step2.title', descriptionKey: 'process.step2.description', number: '02' },
    { icon: Disc, titleKey: 'process.step3.title', descriptionKey: 'process.step3.description', number: '03' },
    { icon: Paintbrush, titleKey: 'process.step4.title', descriptionKey: 'process.step4.description', number: '04' },
    { icon: CheckCircle, titleKey: 'process.step5.title', descriptionKey: 'process.step5.description', number: '05' },
  ];

  return (
    <section id="process" className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('process.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('process.subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Number Badge */}
                <div className="relative z-10 w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center mb-6">
                  <span className="text-primary-foreground font-bold text-lg">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 mx-auto rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                  {t(step.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm">
                  {t(step.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
