export const SITE_URL = 'https://talonplancher.com';
export const SITE_NAME = 'TALON PLANCHER';
export const PHONE = '+1-450-809-3491';
export const PHONE_DISPLAY = '+1 450-809-3491';
export const PHONE_HREF = 'tel:+14508093491';
export const EMAIL = 'sablage@talonplancher.com';
export const AREAS = ['Montréal', 'Rive-Sud', 'Rive-Nord'];
export const AREAS_EN = ['Montreal', 'South Shore', 'North Shore'];

export type Lang = 'fr' | 'en';
export type ServiceKey = 'floor' | 'stairs' | 'repair';

/** Le français est à la racine ; l’anglais est préfixé par /en. */
export const langPrefix = (lang: Lang) => (lang === 'fr' ? '' : '/en');

export const homePath = (lang: Lang) => (lang === 'fr' ? '/' : '/en');

type PerLang<T> = Record<Lang, T>;

export type ServicePage = {
  key: ServiceKey;
  slug: PerLang<string>;
  metaTitle: PerLang<string>;
  metaDescription: PerLang<string>;
  /** Nom court, pour le fil d’Ariane et le JSON-LD BreadcrumbList. */
  navLabel: PerLang<string>;
  /** Nom du service dans le JSON-LD Service. */
  schemaName: PerLang<string>;
  /** Questions de la FAQ existante pertinentes pour ce service. */
  faqKeys: string[];
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    key: 'floor',
    slug: { fr: 'sablage-plancher', en: 'floor-sanding' },
    metaTitle: {
      fr: 'Sablage de plancher de bois franc à Montréal',
      en: 'Hardwood Floor Sanding in Montreal',
    },
    metaDescription: {
      fr: 'Sablage de plancher de bois franc à Montréal, Rive-Sud et Rive-Nord. Enlèvement des rayures, teinture sur mesure et finition durable. Soumission gratuite.',
      en: 'Hardwood floor sanding in Montreal, South Shore and North Shore. Scratch removal, custom stain and durable finish. Free quote.',
    },
    navLabel: { fr: 'Sablage de plancher', en: 'Floor sanding' },
    schemaName: {
      fr: 'Sablage de plancher de bois franc',
      en: 'Hardwood floor sanding',
    },
    faqKeys: ['1', '2', '4', '7'],
  },
  {
    key: 'stairs',
    slug: { fr: 'sablage-escalier', en: 'stair-sanding' },
    metaTitle: {
      fr: "Sablage d’escalier en bois à Montréal",
      en: 'Wood Stair Sanding in Montreal',
    },
    metaDescription: {
      fr: "Sablage d’escalier en bois à Montréal : marches, contremarches, limons et main courante. Finition antidérapante disponible. Soumission gratuite.",
      en: 'Wood stair sanding in Montreal: treads, risers, stringers and handrail. Non-slip finish available. Free quote.',
    },
    navLabel: { fr: "Sablage d’escalier", en: 'Stair sanding' },
    schemaName: { fr: "Sablage d’escalier en bois", en: 'Wood stair sanding' },
    faqKeys: ['8', '1', '4'],
  },
  {
    key: 'repair',
    slug: { fr: 'reparation-plancher', en: 'floor-repair' },
    metaTitle: {
      fr: 'Réparation de plancher de bois franc à Montréal',
      en: 'Hardwood Floor Repair in Montreal',
    },
    metaDescription: {
      fr: 'Réparation de plancher de bois franc à Montréal : lattes endommagées, planches qui craquent, dégâts d’eau. Remplacement harmonisé avec votre plancher existant.',
      en: 'Hardwood floor repair in Montreal: damaged boards, warped planks, water damage. Replacement matched to your existing floor.',
    },
    navLabel: { fr: 'Réparation de plancher', en: 'Floor repair' },
    schemaName: {
      fr: 'Réparation de plancher de bois franc',
      en: 'Hardwood floor repair',
    },
    faqKeys: ['2', '5', '6'],
  },
];

export const getServicePage = (key: ServiceKey): ServicePage =>
  SERVICE_PAGES.find((s) => s.key === key)!;

export const servicePath = (service: ServicePage, lang: Lang) =>
  `${langPrefix(lang)}/${service.slug[lang]}`;

/**
 * Balises hreflang : chaque page déclare son équivalent dans l’autre langue,
 * avec le français en x-default.
 */
export const alternatesFor = (service: ServicePage | null) => {
  const path = (lang: Lang) => (service ? servicePath(service, lang) : homePath(lang));
  return {
    languages: {
      'fr-CA': path('fr'),
      'en-CA': path('en'),
      'x-default': path('fr'),
    },
  };
};

export const HOME_META: Record<Lang, { title: string; description: string }> = {
  fr: {
    title: 'Sablage de plancher Montréal | TALON PLANCHER – Soumission gratuite',
    description:
      "TALON PLANCHER : experts en sablage de plancher, sablage d’escalier et réparation de plancher à Montréal, Rive-Sud et Rive-Nord. Soumission gratuite, résultats impeccables.",
  },
  en: {
    title: 'Floor Sanding Montreal | TALON PLANCHER – Free Quote',
    description:
      'TALON PLANCHER: experts in floor sanding, stair sanding and floor repair in Montreal, South Shore and North Shore. Free quote, impeccable results.',
  },
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#business`,
  name: SITE_NAME,
  description:
    "Experts en sablage de plancher, sablage d’escalier et réparation de planchers de bois franc à Montréal.",
  url: SITE_URL,
  telephone: PHONE,
  email: EMAIL,
  image: `${SITE_URL}/logo.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Montréal',
    addressRegion: 'QC',
    addressCountry: 'CA',
  },
  areaServed: AREAS.map((name) => ({ '@type': 'Place', name })),
  serviceType: [
    'Sablage de plancher',
    "Sablage d’escalier",
    'Réparation de plancher',
    'Finition de plancher',
  ],
  priceRange: '$$',
};

export const buildServiceSchema = (service: ServicePage, lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.schemaName[lang],
  description: service.metaDescription[lang],
  url: `${SITE_URL}${servicePath(service, lang)}`,
  serviceType: service.schemaName[lang],
  provider: { '@id': `${SITE_URL}/#business` },
  areaServed: (lang === 'fr' ? AREAS : AREAS_EN).map((name) => ({
    '@type': 'Place',
    name,
  })),
});

export const buildBreadcrumbSchema = (
  service: ServicePage,
  lang: Lang,
  serviceName: string,
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: lang === 'fr' ? 'Accueil' : 'Home',
      item: `${SITE_URL}${homePath(lang)}`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: serviceName,
      item: `${SITE_URL}${servicePath(service, lang)}`,
    },
  ],
});

/** FAQPage : n’expose que les questions réellement affichées sur la page. */
export const buildFaqSchema = (qa: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: qa.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});
