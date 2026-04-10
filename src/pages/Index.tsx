import { lazy, Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import QuoteForm from '@/components/QuoteForm';
import Footer from '@/components/Footer';

const BelowTheFold = lazy(() => import('@/pages/BelowTheFold'));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <QuoteForm />
        <Suspense fallback={null}>
          <BelowTheFold />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
