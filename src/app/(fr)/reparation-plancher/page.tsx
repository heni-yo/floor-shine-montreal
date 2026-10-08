import { serviceMetadata } from '../../baseMetadata';
import ServicePageBody from '@/components/ServicePageBody';
import { getServicePage } from '@/lib/site';

const service = getServicePage('repair');

export const metadata = serviceMetadata(service, 'fr');

const Page = () => (
  <ServicePageBody service={service} lang="fr" serviceName={service.navLabel.fr} />
);

export default Page;
