import { fontVariables } from '../fonts';
import { rootMetadata } from '../baseMetadata';
import Providers from '../providers';
import JsonLd from '@/components/JsonLd';
import { localBusinessSchema } from '@/lib/site';
import '@/index.css';

export const metadata = rootMetadata('fr');

const FrLayout = ({ children }: { children: React.ReactNode }) => (
  // suppressHydrationWarning : les extensions de navigateur (LanguageTool,
  // Grammarly…) ajoutent des attributs sur <html> avant l'hydratation. Ne
  // s'applique qu'à cet élément — les vraies différences ailleurs restent signalées.
  <html lang="fr-CA" className={fontVariables} suppressHydrationWarning>
    <body>
      <JsonLd data={localBusinessSchema} />
      <Providers language="fr">{children}</Providers>
    </body>
  </html>
);

export default FrLayout;
