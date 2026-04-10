import { Phone, Mail, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
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
              <p className="text-accent-foreground/88">
                {t('footer.cta.description')}
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
              <img
                src="/logofooter.svg"
                alt="TALON PLANCHER – Sablage de plancher à Montréal"
                width={1058}
                height={251}
                className="h-20 w-auto max-w-[280px] object-contain object-left mb-4"
              />
              <p className="text-accent-foreground/88 text-sm">
                {t('footer.brand.description')}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif font-bold text-lg mb-4">{t('footer.contact')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="tel:+15142334083" className="flex items-center gap-3 text-accent-foreground/88 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    (514) 233-4083
                  </a>
                </li>
                <li>
                  <a href="mailto:sablage@talonplancher.com" className="flex items-center gap-3 text-accent-foreground/88 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    sablage@talonplancher.com
                  </a>
                </li>
                <li className="flex items-start gap-3 text-accent-foreground/88">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  Montréal, Rive-Sud, Rive-Nord
                </li>
              </ul>
            </div>

            {/* Why Trust Us (replaces Hours) */}
            <div>
              <h4 className="font-serif font-bold text-lg mb-4">{t('footer.trust.title')}</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-accent-foreground/88 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  {t('footer.trust.1')}
                </li>
                <li className="flex items-start gap-2 text-accent-foreground/88 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  {t('footer.trust.2')}
                </li>
                <li className="flex items-start gap-2 text-accent-foreground/88 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  {t('footer.trust.3')}
                </li>
                <li className="flex items-start gap-2 text-accent-foreground/88 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  {t('footer.trust.4')}
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
                  { key: 'nav.quote', id: 'quote-form' },
                ].map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-accent-foreground/88 hover:text-primary transition-colors"
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
          <p className="text-center text-accent-foreground/75 text-sm">
            © {currentYear} TALON PLANCHER. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
