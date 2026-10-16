/**
 * Calcul du prix sur place (onglet « Calculateur » de l'historique admin).
 *
 * Les tarifs viennent directement de server/config/pricing.ts : modifier un
 * tarif là-bas met à jour à la fois l'estimation du formulaire public et ce
 * calculateur. Les montants saisis restent des chaînes (« 4,75 » en cours de
 * frappe) et ne sont convertis qu'au moment du calcul.
 */
import {
  FLOOR_RATE_PER_SQFT,
  PREFINISHED_FLOOR_SURCHARGE_PER_SQFT,
  STAIR_RATES,
  type StairDetailKey,
} from '../../server/config/pricing';

export type { StairDetailKey };
export type CalcLang = 'fr' | 'en';
export type Unit = 'sqft' | 'linft' | 'each';

/** Taxes du Québec, appliquées sur le montant après rabais. */
export const GST_RATE = 0.05;
export const QST_RATE = 0.09975;

export const STAIR_KEYS = Object.keys(STAIR_RATES) as StairDetailKey[];

const TIME_ZONE = 'America/Toronto';

export interface QtyRate {
  qty: string;
  rate: string;
}

export interface Room {
  id: string;
  name: string;
  length: string;
  width: string;
}

export interface ExtraLine {
  id: string;
  label: string;
  qty: string;
  rate: string;
}

export interface CalcState {
  version: 1;
  lang: CalcLang;
  reference: string;
  createdAt: string;
  /** Demande reçue par le site d'où ce prix a été préparé, le cas échéant. */
  sourceSubmissionId: string;
  client: { name: string; phone: string; email: string; address: string };
  stain: boolean;
  stainColor: string;
  floor: { enabled: boolean; area: string; rooms: Room[]; prefinished: boolean; rate: string };
  stairs: { enabled: boolean; items: Record<StairDetailKey, QtyRate> };
  extras: ExtraLine[];
  discount: { value: string; mode: 'percent' | 'amount' };
  taxes: boolean;
  notes: string;
}

export interface QuoteLine {
  id: string;
  group: 'floor' | 'stairs' | 'extra';
  stairKey?: StairDetailKey;
  label?: string;
  unit: Unit | null;
  qty: number;
  rate: number;
  amount: number;
}

export interface QuoteTotals {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  afterDiscount: number;
  gst: number;
  qst: number;
  total: number;
}

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Accepte « 4,75 », « 4.75 » et « 1 200 » ; tout le reste (vide, négatif, texte) vaut 0. */
export function parseNum(raw: string | undefined | null): number {
  const s = String(raw ?? '')
    .replace(/\s/g, '') // \s couvre aussi les espaces insécables de fr-CA
    .replace(',', '.');
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Tarif affiché dans un champ : « 35 », « 4.75 ». */
export const rateString = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** Même règle que l'estimation du formulaire public (server/lib/estimate.ts). */
export function floorRate(stain: boolean, prefinished: boolean): number {
  const base = stain ? FLOOR_RATE_PER_SQFT.colorNoVarnish : FLOOR_RATE_PER_SQFT.noColorNoVarnish;
  return round2(base + (prefinished ? PREFINISHED_FLOOR_SURCHARGE_PER_SQFT : 0));
}

export const stairDefaultRate = (key: StairDetailKey) => STAIR_RATES[key].ratePerUnit;
export const stairUnit = (key: StairDetailKey): Unit => (STAIR_RATES[key].per === 'pi_lin' ? 'linft' : 'each');

export const roomArea = (room: Room) => round2(parseNum(room.length) * parseNum(room.width));

/** Les pièces mesurées, si présentes, remplacent la superficie saisie à la main. */
export function floorArea(floor: CalcState['floor']): number {
  if (floor.rooms.length) return round2(floor.rooms.reduce((sum, r) => sum + roomArea(r), 0));
  return parseNum(floor.area);
}

/** Numéro lisible, dans le fuseau de Montréal : TP-AAMMJJ-HHMM. */
export function newReference(date = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `TP-${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}`;
}

let idCounter = 0;
export const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export function createInitialState(lang: CalcLang = 'fr', now = new Date()): CalcState {
  return {
    version: 1,
    lang,
    reference: newReference(now),
    createdAt: now.toISOString(),
    sourceSubmissionId: '',
    client: { name: '', phone: '', email: '', address: '' },
    stain: false,
    stainColor: '',
    floor: { enabled: true, area: '', rooms: [], prefinished: false, rate: rateString(floorRate(false, false)) },
    stairs: {
      enabled: false,
      items: Object.fromEntries(
        STAIR_KEYS.map((k) => [k, { qty: '', rate: rateString(stairDefaultRate(k)) }]),
      ) as Record<StairDetailKey, QtyRate>,
    },
    extras: [],
    discount: { value: '', mode: 'percent' },
    taxes: true,
    notes: '',
  };
}

/**
 * Relit un brouillon sauvegardé en le complétant avec les valeurs par défaut :
 * un brouillon d'une version antérieure du calculateur ne doit rien casser.
 */
export function restoreState(raw: unknown): CalcState | null {
  if (!raw || typeof raw !== 'object' || (raw as CalcState).version !== 1) return null;
  const saved = raw as Partial<CalcState>;
  const base = createInitialState(saved.lang === 'en' ? 'en' : 'fr');
  const items = { ...base.stairs.items };
  for (const k of STAIR_KEYS) {
    const it = saved.stairs?.items?.[k];
    if (it && typeof it.qty === 'string' && typeof it.rate === 'string') items[k] = { qty: it.qty, rate: it.rate };
  }
  return {
    ...base,
    ...saved,
    client: { ...base.client, ...saved.client },
    floor: { ...base.floor, ...saved.floor, rooms: Array.isArray(saved.floor?.rooms) ? saved.floor.rooms : [] },
    stairs: { enabled: !!saved.stairs?.enabled, items },
    extras: Array.isArray(saved.extras) ? saved.extras : [],
    discount: { ...base.discount, ...saved.discount },
  };
}

export function computeQuote(state: CalcState): QuoteTotals {
  const lines: QuoteLine[] = [];

  if (state.floor.enabled) {
    const qty = floorArea(state.floor);
    if (qty > 0) {
      const rate = parseNum(state.floor.rate);
      lines.push({ id: 'floor', group: 'floor', unit: 'sqft', qty, rate, amount: round2(qty * rate) });
    }
  }

  if (state.stairs.enabled) {
    for (const key of STAIR_KEYS) {
      const item = state.stairs.items[key];
      const qty = parseNum(item.qty);
      if (qty <= 0) continue;
      const rate = parseNum(item.rate);
      lines.push({ id: key, group: 'stairs', stairKey: key, unit: stairUnit(key), qty, rate, amount: round2(qty * rate) });
    }
  }

  for (const extra of state.extras) {
    const qty = parseNum(extra.qty);
    const rate = parseNum(extra.rate);
    if (qty <= 0 || (!extra.label.trim() && rate <= 0)) continue;
    lines.push({ id: extra.id, group: 'extra', label: extra.label.trim(), unit: null, qty, rate, amount: round2(qty * rate) });
  }

  const subtotal = round2(lines.reduce((sum, l) => sum + l.amount, 0));
  const discountValue = parseNum(state.discount.value);
  const discount =
    state.discount.mode === 'percent'
      ? round2((subtotal * Math.min(discountValue, 100)) / 100)
      : round2(Math.min(discountValue, subtotal));
  const afterDiscount = round2(subtotal - discount);
  const gst = state.taxes ? round2(afterDiscount * GST_RATE) : 0;
  const qst = state.taxes ? round2(afterDiscount * QST_RATE) : 0;

  return { lines, subtotal, discount, afterDiscount, gst, qst, total: round2(afterDiscount + gst + qst) };
}

const locale = (lang: CalcLang) => (lang === 'fr' ? 'fr-CA' : 'en-CA');

export const formatMoney = (n: number, lang: CalcLang) =>
  new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'CAD' }).format(n);

export const formatNumber = (n: number, lang: CalcLang) =>
  new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 2 }).format(n);

export const formatPercent = (rate: number, lang: CalcLang) =>
  new Intl.NumberFormat(locale(lang), { style: 'percent', maximumFractionDigits: 3 }).format(rate);

export const formatDate = (iso: string, lang: CalcLang) =>
  new Date(iso).toLocaleDateString(locale(lang), { timeZone: TIME_ZONE, dateStyle: 'long' });
