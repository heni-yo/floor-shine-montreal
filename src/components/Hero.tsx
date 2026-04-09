import { ArrowRight, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import backgroundImage from '/public/background.png';

const Hero = () => {
  const { t } = useLanguage();

  const scrollToForm = () => {
    const element = document.getElementById('quote-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: "left top"
        }}
      >
        
        <div className="absolute inset-0 bg-black/65"></div>
      </div>
      {/* Content */}
      <div className="relative z-10 container-custom px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium mb-6 animate-fade-up">
            {t('hero.subtitle')}
          </span>

          <h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            {t('hero.title')}
          </h1>

          <p
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            {t('hero.description')}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <button
              onClick={scrollToForm}
              className="btn-primary text-base px-8 py-4"
            >
              {t('hero.cta.quote')}
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="tel:+15142334083"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-md font-semibold hover:bg-white/10 transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              {t('hero.cta.call')}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
