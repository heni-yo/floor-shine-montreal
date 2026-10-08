import type { Metadata } from 'next';
import Link from 'next/link';
import { fontVariables } from './fonts';
import { translate } from '@/lib/translations';
import { PHONE_DISPLAY, PHONE_HREF, SERVICE_PAGES, servicePath } from '@/lib/site';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Page introuvable | TALON PLANCHER',
  robots: { index: false, follow: true },
};

/**
 * Page 404 globale. Une URL inconnue n'appartient à aucun des deux layouts
 * racine, donc on ne connaît pas la langue : français d'abord (site principal),
 * anglais en second.
 */
const GlobalNotFound = () => (
  <html lang="fr-CA" className={fontVariables} suppressHydrationWarning>
    <body>
      <header className="border-b border-border">
        <div className="container-custom flex h-16 items-center md:h-20">
          <Link href="/" aria-label="Talon Plancher">
            <img src="/logoNav.svg" alt="Talon Plancher" width={1058} height={251} className="h-11 w-auto md:h-12" />
          </Link>
        </div>
      </header>

      <main className="container-custom flex min-h-[70vh] items-center py-20">
        <div className="max-w-xl">
          <p className="eyebrow">Erreur 404</p>
          <h1 className="h-display mt-4 text-foreground">{translate('fr', 'notFound.title')}</h1>
          <p className="lead mt-5">{translate('fr', 'notFound.body')}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {translate('en', 'notFound.title')} — {translate('en', 'notFound.body')}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="btn-primary px-6 py-3.5 text-base">
              {translate('fr', 'notFound.home')}
            </Link>
            <a href={PHONE_HREF} className="btn-outline px-6 py-3.5 text-base">
              {PHONE_DISPLAY}
            </a>
          </div>

          <nav aria-label={translate('fr', 'nav.services')} className="mt-12 border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {translate('fr', 'nav.services')}
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {SERVICE_PAGES.map((service) => (
                <li key={service.key}>
                  <Link
                    href={servicePath(service, 'fr')}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {service.navLabel.fr}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/en" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  English
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </main>
    </body>
  </html>
);

export default GlobalNotFound;
