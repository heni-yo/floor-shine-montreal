import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import Process from '@/components/Process';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import Areas from '@/components/Areas';
import FAQ from '@/components/FAQ';

/** Lazy-loaded so the main bundle (Hero, quote form, shell) parses without Embla, etc. */
const BelowTheFold = () => (
  <>
    <Services />
    <WhyUs />
    <Process />
    <Gallery />
    <Testimonials />
    <Areas />
    <FAQ />
  </>
);

export default BelowTheFold;
