import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  const scrollToForm = () => {
    const element = document.getElementById('quote-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-accent text-accent-foreground">
      {/* CTA Section */}
      <div className="section-padding border-b border-accent-foreground/10">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">
                {t('footer.quote')}
              </h3>
              <p className="text-accent-foreground/70">
                {t('hero.description')}
              </p>
            </div>
            <button onClick={scrollToForm} className="btn-primary whitespace-nowrap">
              {t('hero.cta.quote')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold text-xl">S</span>
                </div>
                <span className="font-serif font-semibold text-lg">
                  TALON PLANCHER
                </span>
              </div>
              <p className="text-accent-foreground/70 text-sm">
                {t('hero.description')}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif font-bold text-lg mb-4">{t('footer.contact')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="tel:+15141234567" className="flex items-center gap-3 text-accent-foreground/70 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    (514) 123-4567
                  </a>
                </li>
                <li>
                  <a href="mailto:info@sablagepromtl.ca" className="flex items-center gap-3 text-accent-foreground/70 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    info@sablagepromtl.ca
                  </a>
                </li>
                <li className="flex items-start gap-3 text-accent-foreground/70">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  Montréal, QC
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-serif font-bold text-lg mb-4">{t('footer.hours')}</h4>
              <ul className="space-y-2 text-accent-foreground/70">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('footer.hours.weekday')}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('footer.hours.weekend')}
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-bold text-lg mb-4">{t('footer.links')}</h4>
              <ul className="space-y-2">
                {[
                  { key: 'nav.services', id: 'services' },
                  { key: 'nav.process', id: 'process' },
                  { key: 'nav.gallery', id: 'gallery' },
                  { key: 'nav.testimonials', id: 'testimonials' },
                  { key: 'nav.faq', id: 'faq' },
                ].map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-accent-foreground/70 hover:text-primary transition-colors"
                    >
                      {t(link.key)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-accent-foreground/10">
        <div className="container-custom py-6 px-4">
          <p className="text-center text-accent-foreground/50 text-sm">
            © {currentYear} TALON PLANCHER. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
