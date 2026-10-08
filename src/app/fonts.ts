import { Inter, Playfair_Display } from 'next/font/google';

/**
 * next/font auto-héberge les fichiers, précharge, et génère des métriques de
 * repli qui évitent le décalage de mise en page au chargement.
 */
export const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const serif = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

export const fontVariables = `${sans.variable} ${serif.variable}`;
