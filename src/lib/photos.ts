import type { Lang, ServiceKey } from '@/lib/site';

/**
 * Photos de vrais chantiers (public/img). Les textes alternatifs décrivent ce
 * qu'on voit réellement — ils servent l'accessibilité et le référencement
 * d'images, contrairement aux « Réalisation 1, 2, 3… » génériques.
 *
 * Exclues volontairement : 3b974c5a… et 5672a966… sont des captures d'écran
 * de téléphone (bandes noires, barre d'interface).
 */
export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: Record<Lang, string>;
};

const photo = (file: string, width: number, height: number, fr: string, en: string): Photo => ({
  src: `/img/${file}`,
  width,
  height,
  alt: { fr, en },
});

export const PHOTOS = {
  fireplaceOak: photo('IMG_7227.jpg', 2048, 1536,
    'Plancher de chêne verni avec bordure décorative, près d’un foyer',
    'Varnished oak floor with a decorative border by a fireplace'),
  diningRoom: photo('231dbf24-3148-4628-826b-eba9c48d90f3.jpg', 1200, 1600,
    'Plancher de bois franc fraîchement verni, portes françaises en arrière-plan',
    'Freshly varnished hardwood floor with French doors in the background'),
  darkStairs: photo('IMG_7166.jpg', 1032, 2049,
    'Escalier aux marches teintes foncées et contremarches blanches',
    'Staircase with dark-stained treads and white risers'),
  darkOak: photo('IMG_0518.jpg', 2048, 1536,
    'Plancher de chêne teint et verni dans une pièce vide',
    'Stained and varnished oak floor in an empty room'),
  parquet: photo('IMG_1536.jpg', 2048, 1536,
    'Parqueterie en chêne sablée et vernie',
    'Sanded and varnished oak parquet'),
  curvedStairs: photo('IMG_3799.jpg', 1536, 2048,
    'Escalier tournant en bois après sablage',
    'Curved wooden staircase after sanding'),
  darkGloss: photo('IMG_1266.jpg', 1536, 2048,
    'Plancher de bois franc foncé au fini lustré',
    'Dark hardwood floor with a glossy finish'),
  bedroom: photo('b9b23967-ef82-44d8-9faa-7d0e535bf409.jpg', 1200, 1600,
    'Plancher teint au fini lustré dans une chambre',
    'Stained floor with a glossy finish in a bedroom'),
  stairwell: photo('IMG_7221.jpg', 1536, 2048,
    'Cage d’escalier en bois vue d’en haut',
    'Wooden stairwell seen from above'),
  parquetGloss: photo('IMG_0689.jpg', 1536, 2048,
    'Parqueterie vernie au fini lustré',
    'Varnished parquet with a glossy finish'),
  naturalOak: photo('IMG_1688.jpg', 1536, 2048,
    'Plancher de bois naturel verni',
    'Varnished natural wood floor'),
  stairsSanding: photo('IMG_2525.jpg', 1536, 2048,
    'Escalier en cours de sablage',
    'Staircase being sanded'),
  naturalFloor: photo('IMG_7896.jpg', 1170, 1580,
    'Plancher de bois franc naturel après la finition',
    'Natural hardwood floor after finishing'),
  stainSamples: photo('IMG_9029.jpg', 1536, 2048,
    'Échantillons de teinture appliqués sur le plancher',
    'Stain samples applied to the floor'),
  sanding: photo('IMG_3816.jpg', 1536, 2048,
    'Sablage d’un plancher de bois franc à la sableuse',
    'Sanding a hardwood floor with a drum sander'),
  stairsSamples: photo('IMG_1200.jpg', 2048, 1536,
    'Échantillons de teinture en haut d’un escalier',
    'Stain samples at the top of a staircase'),
  varnishing: photo('IMG_0522.jpg', 1536, 2048,
    'Application du vernis sur un plancher de bois franc',
    'Applying varnish to a hardwood floor'),
  stainChoice: photo('IMG_9033.jpg', 1542, 2048,
    'Échantillons de teinture avant la finition',
    'Stain samples before finishing'),
  brightRoom: photo('IMG_0108.jpg', 2048, 1536,
    'Plancher de bois naturel verni dans une pièce lumineuse',
    'Varnished natural wood floor in a bright room'),
} as const;

/** Image d'en-tête de l'accueil : un vrai chantier, en format paysage. */
export const HERO_PHOTO = PHOTOS.fireplaceOak;

/** Galerie complète : les plus beaux résultats d'abord, les étapes de travail ensuite. */
export const GALLERY: Photo[] = [
  PHOTOS.fireplaceOak,
  PHOTOS.diningRoom,
  PHOTOS.darkStairs,
  PHOTOS.darkOak,
  PHOTOS.parquet,
  PHOTOS.curvedStairs,
  PHOTOS.darkGloss,
  PHOTOS.bedroom,
  PHOTOS.stairwell,
  PHOTOS.parquetGloss,
  PHOTOS.naturalOak,
  PHOTOS.naturalFloor,
  PHOTOS.brightRoom,
  PHOTOS.stairsSanding,
  PHOTOS.sanding,
  PHOTOS.stainSamples,
  PHOTOS.stairsSamples,
  PHOTOS.varnishing,
  PHOTOS.stainChoice,
];

/**
 * Par service : `cover` pour les cartes (recadrage paysage), `hero` pour
 * l'en-tête de la page (portrait), `teaser` pour l'aperçu en bas de page.
 * Aucune photo de réparation proprement dite n'existe : la page réparation
 * montre des travaux en cours, sans les présenter comme des réparations.
 */
export const SERVICE_PHOTOS: Record<ServiceKey, { cover: Photo; hero: Photo; teaser: Photo[] }> = {
  floor: {
    cover: PHOTOS.darkOak,
    hero: PHOTOS.diningRoom,
    teaser: [PHOTOS.parquet, PHOTOS.darkGloss, PHOTOS.parquetGloss, PHOTOS.bedroom],
  },
  stairs: {
    cover: PHOTOS.darkStairs,
    hero: PHOTOS.darkStairs,
    teaser: [PHOTOS.stairwell, PHOTOS.curvedStairs, PHOTOS.stairsSanding, PHOTOS.stairsSamples],
  },
  repair: {
    cover: PHOTOS.sanding,
    hero: PHOTOS.sanding,
    teaser: [PHOTOS.varnishing, PHOTOS.stainSamples, PHOTOS.stainChoice, PHOTOS.naturalOak],
  },
};

/** Photo de la section « Pourquoi nous » : un résultat fini, sans doublon avec les cartes de l'accueil. */
export const WHY_PHOTO = PHOTOS.diningRoom;
