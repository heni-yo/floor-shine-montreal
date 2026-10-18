import { stainColorsMetadata } from '../../baseMetadata';
import JsonLd from '@/components/JsonLd';
import StainColorsPage from '@/components/StainColorsPage';
import { buildPageBreadcrumbSchema } from '@/lib/site';
import { STAIN_PATHS } from '@/lib/stainColors';
import { translate } from '@/lib/translations';

export const metadata = stainColorsMetadata('fr');

const Page = () => (
  <>
    <JsonLd data={buildPageBreadcrumbSchema('fr', translate('fr', 'nav.stains'), STAIN_PATHS.fr)} />
    <StainColorsPage />
  </>
);

export default Page;
