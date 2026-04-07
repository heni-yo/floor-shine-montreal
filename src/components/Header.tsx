import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { key: 'nav.services', id: 'services' },
    { key: 'nav.why', id: 'why-us' },
    { key: 'nav.process', id: 'process' },
    { key: 'nav.gallery', id: 'gallery' },
    { key: 'nav.testimonials', id: 'testimonials' },
    { key: 'nav.faq', id: 'faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">T</span>
            </div>
            <span className="font-serif font-semibold text-lg text-foreground hidden sm:block">
              TALON PLANCHER
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {t(item.key)}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>

            {/* Phone CTA - Desktop */}
            <a
              href="tel:+15141234567"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>(514) 123-4567</span>
            </a>

            {/* Quote Button - Desktop */}
            <button
              onClick={() => scrollToSection('quote-form')}
              className="hidden md:block btn-primary text-sm py-2 px-4"
            >
              {t('nav.quote')}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background animate-fade-in">
            <nav className="flex flex-col py-4 px-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="py-3 text-left text-foreground hover:text-primary transition-colors"
                >
                  {t(item.key)}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-border flex flex-col gap-3">
                <a
                  href="tel:+15141234567"
                  className="flex items-center gap-2 text-primary"
                >
                  <Phone className="w-4 h-4" />
                  <span>(514) 123-4567</span>
                </a>
                <button
                  onClick={() => scrollToSection('quote-form')}
                  className="btn-primary text-center"
                >
                  {t('nav.quote')}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
