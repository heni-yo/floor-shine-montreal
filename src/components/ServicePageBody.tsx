import Header from '@/components/Header';
import ServiceIntro from '@/components/ServiceIntro';
import QuoteForm from '@/components/QuoteForm';
import Areas from '@/components/Areas';
import FAQ from '@/components/FAQ';
import GalleryTeaser from '@/components/GalleryTeaser';
import RelatedServices from '@/components/RelatedServices';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import MobileCta from '@/components/MobileCta';
import ServiceFaqSection from '@/components/ServiceFaqSection';
import {
  buildBreadcrumbSchema,
  buildServiceSchema,
  type Lang,
  type ServicePage,
} from '@/lib/site';

/**
 * Volontairement plus léger que l'accueil : ni WhyUs, ni Process, ni galerie
 * complète. Ces blocs identiques sur 4 pages faisaient du contenu dupliqué.
 */
const ServicePageBody = ({
  service,
  lang,
  serviceName,
}: {
  service: ServicePage;
  lang: Lang;
  serviceName: string;
}) => (
  <>
    <JsonLd data={buildServiceSchema(service, lang)} />
    <JsonLd data={buildBreadcrumbSchema(service, lang, serviceName)} />
    <Header />
    <main className="pb-16 lg:pb-0">
      <ServiceIntro serviceKey={service.key} />
      <QuoteForm defaultService={service.key} />
      <Areas />
      <ServiceFaqSection faqKeys={service.faqKeys} />
      <GalleryTeaser serviceKey={service.key} />
      <RelatedServices current={service.key} />
    </main>
    <Footer />
    <MobileCta />
  </>
);

export default ServicePageBody;
