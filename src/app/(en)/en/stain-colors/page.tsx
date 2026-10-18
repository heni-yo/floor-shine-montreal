import { stainColorsMetadata } from '../../../baseMetadata';
import JsonLd from '@/components/JsonLd';
import StainColorsPage from '@/components/StainColorsPage';
import { buildPageBreadcrumbSchema } from '@/lib/site';
import { STAIN_PATHS } from '@/lib/stainColors';
import { translate } from '@/lib/translations';

export const metadata = stainColorsMetadata('en');

const Page = () => (
  <>
    <JsonLd data={buildPageBreadcrumbSchema('en', translate('en', 'nav.stains'), STAIN_PATHS.en)} />
    <StainColorsPage />
  </>
);

export default Page;
