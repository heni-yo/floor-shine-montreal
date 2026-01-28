import Header from '@/components/Header';
import Hero from '@/components/Hero';
import QuoteForm from '@/components/QuoteForm';
import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import Process from '@/components/Process';
import Gallery from '@/components/Gallery';
import Testimonials from '@/components/Testimonials';
import Areas from '@/components/Areas';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <QuoteForm />
        <Services />
        <WhyUs />
        <Process />
        <Gallery />
        <Testimonials />
        <Areas />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
