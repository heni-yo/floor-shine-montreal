import { fontVariables } from '../fonts';
import { rootMetadata } from '../baseMetadata';
import Providers from '../providers';
import JsonLd from '@/components/JsonLd';
import { localBusinessSchema } from '@/lib/site';
import '@/index.css';

export const metadata = rootMetadata('en');

const EnLayout = ({ children }: { children: React.ReactNode }) => (
  // Voir le commentaire dans (fr)/layout.tsx.
  <html lang="en-CA" className={fontVariables} suppressHydrationWarning>
    <body>
      <JsonLd data={localBusinessSchema} />
      <Providers language="en">{children}</Providers>
    </body>
  </html>
);

export default EnLayout;
