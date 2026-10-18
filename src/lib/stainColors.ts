import type { Lang } from '@/lib/site';

/**
 * Nuancier DuraSeal (36 teintures), tel que publié sur
 * https://www.duraseal.com/stain-gallery/ — sur chêne rouge et chêne blanc.
 *
 * Les couleurs ne sont pas des images du fabricant : ce sont les tons moyens
 * (base, veines foncées, veines claires) mesurés sur chaque échantillon du
 * nuancier officiel, pour dessiner un aperçu en CSS. Elles restent
 * approximatives ; le lien vers le nuancier officiel est toujours proposé.
 */
export const DURASEAL_GALLERY_URL = 'https://www.duraseal.com/stain-gallery/';

export type Species = 'redOak' | 'whiteOak';
export type StainFamily = 'light' | 'golden' | 'brown' | 'dark' | 'red' | 'gray';

/** [base, veines foncées, veines claires] */
export type Tones = readonly [string, string, string];

export interface StainColor {
  name: string;
  family: StainFamily;
  tones: Record<Species, Tones | null>;
}

const stain = (name: string, family: StainFamily, whiteOak: Tones, redOak: Tones | null): StainColor => ({
  name,
  family,
  tones: { whiteOak, redOak },
});

export const STAIN_COLORS: StainColor[] = [
  stain('Aged Barrel', 'gray', ['#705f54', '#63564e', '#7b6759'], ['#8b775e', '#726554', '#a18767']),
  stain('Antique Brown', 'dark', ['#564138', '#473835', '#684b3b'], ['#76523b', '#5c4536', '#8a5e3e']),
  stain('Cherry', 'red', ['#9f6f52', '#906047', '#ab7c5d'], ['#cc8e62', '#b17551', '#dda070']),
  stain('Chestnut', 'brown', ['#75523d', '#644537', '#835e43'], ['#8e6240', '#6a4b39', '#a67347']),
  stain('Classic Gray', 'gray', ['#71645d', '#6c615a', '#77685f'], ['#9a896e', '#877b66', '#aa9374']),
  stain('Coffee Brown', 'brown', ['#64483b', '#543e36', '#70503e'], ['#76553e', '#584236', '#906646']),
  stain('Colonial Maple', 'golden', ['#a97151', '#9b6448', '#b57c58'], ['#ce894a', '#ba7541', '#dd9954']),
  stain('Country White', 'light', ['#c5ac95', '#b7a08b', '#d0b8a0'], ['#e7d3b9', '#e2ccb1', '#ecd9c1']),
  stain('Dark Gray', 'gray', ['#776960', '#6d635c', '#817064'], ['#9b876d', '#857966', '#ae9575']),
  stain('Dark Walnut', 'brown', ['#654c3e', '#534038', '#755844'], ['#876140', '#684d38', '#9f7248']),
  stain('Early American', 'golden', ['#875e43', '#79513b', '#956a4c'], ['#a87445', '#8c5e3c', '#bd844d']),
  stain('Ebony', 'dark', ['#4e413b', '#3f3836', '#604d42'], ['#65503e', '#4b4036', '#7b5f45']),
  stain('English Chestnut', 'brown', ['#7b5340', '#6a4539', '#8d6348'], ['#9a6439', '#7c5235', '#af733d']),
  stain('Espresso', 'dark', ['#644b3d', '#544139', '#725542'], ['#79573f', '#584437', '#9a6b47']),
  stain('Fruitwood', 'light', ['#9d7555', '#90694c', '#a9805d'], ['#be966a', '#af8862', '#cba272']),
  stain('Golden Brown', 'brown', ['#674737', '#593e33', '#77533c'], ['#916941', '#70533b', '#aa7b46']),
  stain('Golden Oak', 'golden', ['#9c734e', '#8c6345', '#ac8259'], ['#c99557', '#b6824c', '#d8a562']),
  stain('Golden Pecan', 'golden', ['#a87352', '#9d694a', '#b17c59'], ['#c78c5c', '#b7794d', '#d29d6a']),
  stain('Gunstock', 'red', ['#8c5843', '#7f4e3c', '#976149'], ['#b2713d', '#965d36', '#c57e43']),
  stain('Heritage Brown', 'gray', ['#5c5047', '#514741', '#67574d'], ['#6b5747', '#56483e', '#7f6550']),
  stain('Jacobean', 'dark', ['#5f4b3f', '#4c3e38', '#735845'], ['#7b5c42', '#554438', '#99704a']),
  stain('Medium Brown', 'brown', ['#65493b', '#563f36', '#755540'], ['#805e3f', '#654d3b', '#946b42']),
  stain('Neutral', 'light', ['#a97d58', '#9a704f', '#b68961'], ['#cf9a6a', '#be8458', '#e0ae7b']),
  stain('Nutmeg', 'golden', ['#886044', '#78513c', '#99704f'], ['#b7804a', '#99653e', '#ca9254']),
  stain('Provincial', 'brown', ['#775441', '#65473b', '#886148'], ['#9c734a', '#7a5a41', '#b28451']),
  stain('Red Mahogany', 'red', ['#5c403b', '#503a37', '#67473f'], ['#7d5742', '#5b463a', '#98684a']),
  stain('Rosewood', 'red', ['#68483c', '#553d37', '#785241'], ['#7b523a', '#604436', '#93603e']),
  stain('Royal Mahogany', 'red', ['#4a3938', '#403434', '#543e3b'], ['#482e2b', '#392624', '#583632']),
  stain('Rustic Beige', 'light', ['#9a7f69', '#907764', '#a3876f'], ['#b99f7c', '#a59071', '#c8ab87']),
  stain('Sedona Red', 'red', ['#6f4438', '#5d3b34', '#7c4c3c'], ['#8f563c', '#684437', '#ae6742']),
  stain('Silvered Gray', 'gray', ['#af8f76', '#a78770', '#b6957d'], ['#caab87', '#b59a7c', '#daba92']),
  stain('Special Walnut', 'brown', ['#72503f', '#66473b', '#7e5a44'], ['#976a48', '#75533d', '#af7d52']),
  // Sur chêne rouge, l'échantillon publié est identique à « Aged Barrel » :
  // erreur du nuancier en ligne, on n'affiche donc que le chêne blanc.
  stain('Spice Brown', 'dark', ['#564137', '#483934', '#64493a'], null),
  stain('True Black', 'dark', ['#343235', '#2f2f33', '#393536'], ['#322b2b', '#2b2525', '#3a3131']),
  stain('Warm Gray', 'gray', ['#826f60', '#77685c', '#8a7563'], ['#a48c72', '#8c7c6a', '#b4997b']),
  stain('Weathered Oak', 'light', ['#a07d61', '#95735a', '#aa8869'], ['#ba966f', '#a88966', '#c9a177']),
];

export const STAIN_FAMILIES: StainFamily[] = ['light', 'golden', 'brown', 'dark', 'red', 'gray'];

/** Luminance relative, pour classer du plus pâle au plus foncé. */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Aperçu « planches de bois » : fil horizontal irrégulier, joints entre les
 * planches et léger reflet, à partir des trois tons mesurés.
 */
export function swatchBackground([, dark, light]: Tones): string {
  const rgba = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  return [
    // Joints entre les planches
    'linear-gradient(180deg, transparent 32.6%, rgba(0,0,0,.2) 32.6%, rgba(0,0,0,.2) 33.2%, transparent 33.2%, transparent 66%, rgba(0,0,0,.2) 66%, rgba(0,0,0,.2) 66.6%, transparent 66.6%)',
    // Reflet du vernis
    'linear-gradient(115deg, rgba(255,255,255,.12), rgba(255,255,255,0) 50%)',
    // Fil du bois : trois réseaux de veines aux pas et angles différents,
    // pour éviter l'effet de rayures régulières.
    `repeating-linear-gradient(178.6deg, transparent 0 9px, ${rgba(dark, 0.55)} 9px 10px, transparent 10px 23px)`,
    `repeating-linear-gradient(181.2deg, transparent 0 13px, ${rgba(light, 0.6)} 13px 16px, transparent 16px 31px)`,
    `repeating-linear-gradient(179.4deg, transparent 0 5px, ${rgba(dark, 0.3)} 5px 6px, transparent 6px 17px)`,
  ].join(', ');
}

export const STAIN_PATHS: Record<Lang, string> = {
  fr: '/couleurs-teinture',
  en: '/en/stain-colors',
};
