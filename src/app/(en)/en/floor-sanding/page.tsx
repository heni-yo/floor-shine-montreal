import { serviceMetadata } from '../../../baseMetadata';
import ServicePageBody from '@/components/ServicePageBody';
import { getServicePage } from '@/lib/site';

const service = getServicePage('floor');

export const metadata = serviceMetadata(service, 'en');

const Page = () => (
  <ServicePageBody service={service} lang="en" serviceName={service.navLabel.en} />
);

export default Page;
