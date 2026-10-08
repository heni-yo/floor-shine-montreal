import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import QuoteForm from '@/components/QuoteForm';
import Process from '@/components/Process';
import WhyUs from '@/components/WhyUs';
import Areas from '@/components/Areas';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import MobileCta from '@/components/MobileCta';

/** Embla n'est chargé que lorsqu'on atteint la galerie, hors du bundle initial. */
const Gallery = dynamic(() => import('@/components/Gallery'));

/**
 * Le formulaire vient juste après les services : le visiteur comprend l'offre,
 * puis convertit. Les sections suivantes servent de réassurance.
 */
const HomeBody = () => (
  <>
    <Header />
    <main className="pb-16 lg:pb-0">
      <Hero />
      <Services />
      <QuoteForm />
      <Process />
      <Gallery />
      <WhyUs />
      <Areas />
      <FAQ />
    </main>
    <Footer />
    <MobileCta />
  </>
);

export default HomeBody;
