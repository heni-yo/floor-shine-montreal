'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Copy, Minus, Plus, Printer, RotateCcw, Ruler, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AREAS, AREAS_EN, EMAIL, PHONE_DISPLAY, SITE_NAME } from '@/lib/site';
import {
  GST_RATE,
  QST_RATE,
  STAIR_KEYS,
  computeQuote,
  createInitialState,
  floorArea,
  floorRate,
  formatDate,
  formatMoney,
  formatNumber,
  formatPercent,
  newId,
  parseNum,
  rateString,
  restoreState,
  roomArea,
  stairDefaultRate,
  stairUnit,
  type CalcLang,
  type CalcState,
  type QtyRate,
  type QuoteLine,
  type QuoteTotals,
  type StairDetailKey,
  type Unit,
} from '@/lib/quoteCalculator';

/** Demande de l'historique à partir de laquelle on prépare le prix. */
export interface QuoteSeed {
  submissionId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  services: { floor?: boolean; stairs?: boolean; repair?: boolean };
}

/** Le brouillon survit à un rechargement, mais disparaît avec l'onglet. */
const DRAFT_KEY = 'talon_quote_draft';

const TEXT = {
  fr: {
    title: 'Calculateur de soumission',
    intro: 'Chiffrez le travail sur place avec vos tarifs. Rien n’est envoyé ni enregistré sur le serveur : le brouillon reste dans cet onglet.',
    fromSubmission: 'Préparée à partir de la demande',
    language: 'Langue de la soumission',
    sections: {
      client: 'Client',
      finish: 'Finition',
      floor: 'Plancher',
      stairs: 'Escalier',
      extras: 'Autres travaux',
      adjust: 'Rabais et taxes',
      notes: 'Notes sur la soumission',
    },
    client: { name: 'Nom du client', phone: 'Téléphone', email: 'Courriel', address: 'Adresse des travaux' },
    natural: 'Naturel',
    stained: 'Avec teinte',
    stainColor: 'Couleur de la teinte',
    stainColorPh: 'ex. noir brun',
    stainHint: 'La teinte change le tarif du plancher.',
    include: 'Inclus',
    exclude: 'Non inclus',
    area: 'Superficie',
    prefinished: 'Plancher préverni (usine)',
    no: 'Non',
    yes: 'Oui',
    measureRooms: 'Mesurer par pièce',
    addRoom: 'Ajouter une pièce',
    roomName: 'Nom de la pièce',
    roomPh: (n: number) => `Pièce ${n}`,
    length: 'Longueur',
    width: 'Largeur',
    removeRoom: 'Retirer la pièce',
    roomsHint: 'Superficie calculée à partir des pièces.',
    rate: 'Tarif',
    resetRate: (r: string) => `Revenir au tarif normal (${r})`,
    quantity: 'Quantité',
    decrease: 'Diminuer',
    increase: 'Augmenter',
    addExtra: 'Ajouter une ligne',
    extraPh: 'Description',
    extraUntitled: 'Autre travail',
    removeExtra: 'Retirer la ligne',
    suggestions: ['Réparation de lattes', 'Déplacement des meubles', 'Couche de finition supplémentaire'],
    repairLine: 'Réparation de plancher',
    discount: 'Rabais',
    taxesOn: 'Avec taxes',
    taxesOff: 'Sans taxes',
    notesPh: 'Délais, conditions, validité de la soumission…',
    summary: 'Résumé',
    subtotal: 'Sous-total',
    afterDiscount: 'Total avant taxes',
    gst: 'TPS',
    qst: 'TVQ',
    total: 'Total',
    empty: 'Entrez une superficie ou des quantités pour voir le prix.',
    print: 'Imprimer / PDF',
    copy: 'Copier le résumé',
    copied: 'Résumé copié',
    copyFailed: 'Copie impossible sur cet appareil',
    newQuote: 'Nouvelle soumission',
    details: 'Détail',
    resetTitle: 'Commencer une nouvelle soumission ?',
    resetBody: 'Le brouillon actuel sera effacé.',
    replaceTitle: 'Remplacer le brouillon ?',
    replaceBody: (id: string) => `Le brouillon actuel sera remplacé par une soumission préparée pour la demande ${id}.`,
    cancel: 'Annuler',
    confirm: 'Continuer',
    units: { sqft: 'pi²', linft: 'pi lin.', each: 'unité', ft: 'pi' },
    floorLine: 'Sablage de plancher de bois franc',
    stairsLine: 'Sablage d’escalier',
    naturalTag: 'naturel, sans teinte',
    stainTag: (color: string) => (color ? `teinte ${color}` : 'avec teinte'),
    prefinishedTag: 'plancher préverni',
    stairLabels: {
      marches: 'Marches',
      contremarches: 'Contremarches',
      mainCourante: 'Main courante',
      limon: 'Limon',
      fauxLimon: 'Faux limon',
      barreaux: 'Barreaux',
      poteaux: 'Poteaux',
    } satisfies Record<StairDetailKey, string>,
    doc: {
      quote: 'Soumission',
      number: 'N°',
      date: 'Date',
      client: 'Client',
      request: 'Demande',
      description: 'Description',
      quantity: 'Quantité',
      unitPrice: 'Prix unitaire',
      amount: 'Montant',
      notes: 'Notes',
      beforeTaxes: 'Montants avant taxes applicables.',
      thanks: 'Merci de votre confiance !',
    },
  },
  en: {
    title: 'Quote calculator',
    intro: 'Price the job on site with your rates. Nothing is sent or saved on the server: the draft stays in this tab.',
    fromSubmission: 'Prepared from request',
    language: 'Quote language',
    sections: {
      client: 'Client',
      finish: 'Finish',
      floor: 'Floor',
      stairs: 'Staircase',
      extras: 'Other work',
      adjust: 'Discount and taxes',
      notes: 'Notes on the quote',
    },
    client: { name: 'Client name', phone: 'Phone', email: 'Email', address: 'Job address' },
    natural: 'Natural',
    stained: 'Stained',
    stainColor: 'Stain colour',
    stainColorPh: 'e.g. black brown',
    stainHint: 'Stain changes the floor rate.',
    include: 'Included',
    exclude: 'Not included',
    area: 'Area',
    prefinished: 'Prefinished floor (factory)',
    no: 'No',
    yes: 'Yes',
    measureRooms: 'Measure by room',
    addRoom: 'Add a room',
    roomName: 'Room name',
    roomPh: (n: number) => `Room ${n}`,
    length: 'Length',
    width: 'Width',
    removeRoom: 'Remove room',
    roomsHint: 'Area calculated from the rooms.',
    rate: 'Rate',
    resetRate: (r: string) => `Back to the regular rate (${r})`,
    quantity: 'Quantity',
    decrease: 'Decrease',
    increase: 'Increase',
    addExtra: 'Add a line',
    extraPh: 'Description',
    extraUntitled: 'Other work',
    removeExtra: 'Remove line',
    suggestions: ['Board repair', 'Moving furniture', 'Extra finish coat'],
    repairLine: 'Floor repair',
    discount: 'Discount',
    taxesOn: 'With taxes',
    taxesOff: 'No taxes',
    notesPh: 'Schedule, conditions, quote validity…',
    summary: 'Summary',
    subtotal: 'Subtotal',
    afterDiscount: 'Total before taxes',
    gst: 'GST',
    qst: 'QST',
    total: 'Total',
    empty: 'Enter an area or quantities to see the price.',
    print: 'Print / PDF',
    copy: 'Copy summary',
    copied: 'Summary copied',
    copyFailed: 'Copy is not available on this device',
    newQuote: 'New quote',
    details: 'Details',
    resetTitle: 'Start a new quote?',
    resetBody: 'The current draft will be cleared.',
    replaceTitle: 'Replace the draft?',
    replaceBody: (id: string) => `The current draft will be replaced by a quote prepared for request ${id}.`,
    cancel: 'Cancel',
    confirm: 'Continue',
    units: { sqft: 'sq ft', linft: 'lin. ft', each: 'each', ft: 'ft' },
    floorLine: 'Hardwood floor sanding',
    stairsLine: 'Stair sanding',
    naturalTag: 'natural, no stain',
    stainTag: (color: string) => (color ? `${color} stain` : 'stained'),
    prefinishedTag: 'prefinished floor',
    stairLabels: {
      marches: 'Treads',
      contremarches: 'Risers',
      mainCourante: 'Handrail',
      limon: 'Stringer',
      fauxLimon: 'Wall stringer',
      barreaux: 'Balusters',
      poteaux: 'Newel posts',
    } satisfies Record<StairDetailKey, string>,
    doc: {
      quote: 'Quote',
      number: 'No.',
      date: 'Date',
      client: 'Client',
      request: 'Request',
      description: 'Description',
      quantity: 'Quantity',
      unitPrice: 'Unit price',
      amount: 'Amount',
      notes: 'Notes',
      beforeTaxes: 'Amounts before applicable taxes.',
      thanks: 'Thank you for your trust!',
    },
  },
};

type Text = (typeof TEXT)['fr'];

// ---------------------------------------------------------------------------
// Libellés partagés par l'écran, l'impression et le résumé copié

function lineLabel(line: QuoteLine, t: Text): string {
  if (line.group === 'floor') return t.floorLine;
  if (line.group === 'stairs') return t.stairLabels[line.stairKey!];
  return line.label || t.extraUntitled;
}

function stainTag(state: CalcState, t: Text): string {
  return state.stain ? t.stainTag(state.stainColor.trim()) : t.naturalTag;
}

function floorDetail(state: CalcState, t: Text): string {
  return [stainTag(state, t), state.floor.prefinished && t.prefinishedTag].filter(Boolean).join(' · ');
}

function roomsDetail(state: CalcState, t: Text): string {
  return state.floor.rooms
    .filter((r) => roomArea(r) > 0)
    .map((r, i) => `${r.name.trim() || t.roomPh(i + 1)} ${formatNumber(roomArea(r), state.lang)} ${t.units.sqft}`)
    .join(', ');
}

function formatQty(line: QuoteLine, lang: CalcLang, t: Text): string {
  const n = formatNumber(line.qty, lang);
  return line.unit === 'sqft' || line.unit === 'linft' ? `${n} ${t.units[line.unit]}` : n;
}

function formatRate(line: QuoteLine, lang: CalcLang, t: Text): string {
  const money = formatMoney(line.rate, lang);
  return line.unit === 'sqft' || line.unit === 'linft' ? `${money}/${t.units[line.unit]}` : money;
}

function discountLabel(state: CalcState, t: Text): string {
  const v = parseNum(state.discount.value);
  return state.discount.mode === 'percent' ? `${t.discount} (${formatPercent(Math.min(v, 100) / 100, state.lang)})` : t.discount;
}

function totalsRows(state: CalcState, q: QuoteTotals, t: Text): [string, string][] {
  const m = (n: number) => formatMoney(n, state.lang);
  const rows: [string, string][] = [[t.subtotal, m(q.subtotal)]];
  if (q.discount > 0) {
    rows.push([discountLabel(state, t), `−${m(q.discount)}`]);
    if (state.taxes) rows.push([t.afterDiscount, m(q.afterDiscount)]);
  }
  if (state.taxes) {
    rows.push([`${t.gst} (${formatPercent(GST_RATE, state.lang)})`, m(q.gst)]);
    rows.push([`${t.qst} (${formatPercent(QST_RATE, state.lang)})`, m(q.qst)]);
  }
  return rows;
}

/** Texte brut à coller dans un texto ou un courriel. */
function buildSummaryText(state: CalcState, q: QuoteTotals, t: Text): string {
  const { lang } = state;
  const out: string[] = [
    `${SITE_NAME} — ${t.doc.quote} ${state.reference}`,
    `${t.doc.date} : ${formatDate(state.createdAt, lang)}`,
  ];
  if (state.client.name.trim()) out.push(`${t.doc.client} : ${state.client.name.trim()}`);
  if (state.client.address.trim()) out.push(state.client.address.trim());
  out.push('');

  const line = (l: QuoteLine, indent = '') =>
    `${indent}${lineLabel(l, t)} : ${formatQty(l, lang, t)} × ${formatRate(l, lang, t)} = ${formatMoney(l.amount, lang)}`;

  for (const l of q.lines.filter((x) => x.group === 'floor')) {
    out.push(`${line(l)} (${[floorDetail(state, t), roomsDetail(state, t)].filter(Boolean).join(' — ')})`);
  }
  const stairs = q.lines.filter((x) => x.group === 'stairs');
  if (stairs.length) {
    out.push(`${t.stairsLine} (${stainTag(state, t)})`);
    stairs.forEach((l) => out.push(line(l, '  ')));
  }
  q.lines.filter((x) => x.group === 'extra').forEach((l) => out.push(line(l)));

  out.push('');
  for (const [label, value] of totalsRows(state, q, t)) out.push(`${label} : ${value}`);
  out.push(`${t.total.toUpperCase()} : ${formatMoney(q.total, lang)}`);
  if (!state.taxes) out.push(t.doc.beforeTaxes);
  if (state.notes.trim()) out.push('', state.notes.trim());
  out.push('', `${SITE_NAME} · ${PHONE_DISPLAY} · ${EMAIL}`);

  // En anglais, pas d'espace avant les deux-points.
  return (lang === 'en' ? out.map((s) => s.replace(/ : /g, ': ')) : out).join('\n');
}

function hasContent(state: CalcState): boolean {
  return computeQuote(state).subtotal > 0 || !!state.client.name.trim() || !!state.notes.trim();
}

function loadDraft(): CalcState {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    const restored = raw ? restoreState(JSON.parse(raw)) : null;
    if (restored) return restored;
  } catch {
    /* stockage indisponible ou brouillon illisible : on repart de zéro */
  }
  return createInitialState();
}

// ---------------------------------------------------------------------------
// Petits composants de saisie, pensés pour le doigt sur une tablette

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <h2 className="font-sans text-sm font-semibold text-foreground">{title}</h2>
        {aside}
      </div>
      {children && <div className="border-t border-border px-4 py-4 sm:px-5">{children}</div>}
    </section>
  );
}

function Segmented<V extends string | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex shrink-0 rounded-lg border border-border bg-surface p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-9 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({
  id,
  value,
  onChange,
  prefix,
  suffix,
  ariaLabel,
  readOnly,
  autoFocus,
  className,
}: {
  id?: string;
  value: string;
  onChange?: (v: string) => void;
  prefix?: string;
  suffix?: string;
  ariaLabel?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-10 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        readOnly && 'bg-surface',
        className,
      )}
    >
      {prefix && <span className="text-muted-foreground">{prefix}</span>}
      <input
        id={id}
        aria-label={ariaLabel}
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        readOnly={readOnly}
        value={value}
        placeholder="0"
        onChange={(e) => onChange?.(e.target.value.replace(/[^\d.,\s]/g, ''))}
        className="w-full min-w-0 bg-transparent text-right tabular-nums outline-none placeholder:text-muted-foreground/60"
      />
      {suffix && <span className="whitespace-nowrap text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function Stepper({ value, onChange, label, t }: { value: string; onChange: (v: string) => void; label: string; t: Text }) {
  const n = parseNum(value);
  const btn =
    'grid h-10 w-10 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
  return (
    <div className="flex w-[8.5rem] items-center rounded-md border border-input bg-background">
      <button type="button" className={btn} aria-label={`${t.decrease} — ${label}`} disabled={n <= 0} onClick={() => onChange(String(Math.max(0, n - 1)))}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        aria-label={`${t.quantity} — ${label}`}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,\s]/g, ''))}
        className="h-10 w-full min-w-0 border-x border-input bg-transparent text-center text-sm tabular-nums outline-none placeholder:text-muted-foreground/60 focus:bg-primary-soft"
      />
      <button type="button" className={btn} aria-label={`${t.increase} — ${label}`} onClick={() => onChange(String(n + 1))}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function RateInput({
  value,
  onChange,
  defaultRate,
  unit,
  label,
  lang,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  defaultRate: number;
  unit: Unit;
  label: string;
  lang: CalcLang;
  t: Text;
}) {
  const changed = parseNum(value) !== defaultRate;
  const reset = t.resetRate(formatMoney(defaultRate, lang));
  return (
    <div className="flex items-center gap-1">
      <NumberInput
        ariaLabel={`${t.rate} — ${label}`}
        value={value}
        onChange={onChange}
        prefix={lang === 'en' ? '$' : undefined}
        suffix={lang === 'fr' ? `$/${t.units[unit]}` : `/${t.units[unit]}`}
        className={cn('w-full', changed && 'border-primary/60 bg-primary-soft')}
      />
      {/* Toujours rendu (invisible) pour que les colonnes ne bougent pas. */}
      <button
        type="button"
        onClick={() => onChange(rateString(defaultRate))}
        title={reset}
        aria-label={reset}
        tabIndex={changed ? 0 : -1}
        aria-hidden={!changed}
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-md text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !changed && 'invisible',
        )}
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Document imprimé (ou enregistré en PDF depuis la boîte d'impression)

function PrintableQuote({ state, quote, t }: { state: CalcState; quote: QuoteTotals; t: Text }) {
  const { lang } = state;
  const m = (n: number) => formatMoney(n, lang);
  const floorLines = quote.lines.filter((l) => l.group === 'floor');
  const stairLines = quote.lines.filter((l) => l.group === 'stairs');
  const extraLines = quote.lines.filter((l) => l.group === 'extra');
  const rooms = roomsDetail(state, t);
  const c = state.client;

  const row = (l: QuoteLine, detail?: string, indent = false) => (
    <tr key={l.id} className="break-inside-avoid border-b border-black/10 align-top">
      <td className={cn('py-2 pr-3', indent && 'pl-4')}>
        <span className={indent ? undefined : 'font-semibold'}>{lineLabel(l, t)}</span>
        {detail && <span className="block text-[9pt] text-black/60">{detail}</span>}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{formatQty(l, lang, t)}</td>
      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{formatRate(l, lang, t)}</td>
      <td className="whitespace-nowrap py-2 pl-3 text-right font-medium tabular-nums">{m(l.amount)}</td>
    </tr>
  );

  return (
    <article lang={lang === 'fr' ? 'fr-CA' : 'en-CA'} className="hidden font-sans text-[10.5pt] leading-snug text-black print:block">
      <header className="flex items-start justify-between gap-6 border-b-2 border-primary pb-4">
        <div>
          <img src="/logoNav.svg" alt={SITE_NAME} width={1058} height={251} className="h-11 w-auto" />
          <p className="mt-3 text-[9pt] text-black/70">
            {PHONE_DISPLAY} · {EMAIL} · talonplancher.com
            <br />
            {(lang === 'fr' ? AREAS : AREAS_EN).join(' · ')}
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif text-[20pt] font-bold uppercase tracking-wide text-primary">{t.doc.quote}</p>
          <p className="mt-1 text-[9.5pt]">
            {t.doc.number} <span className="font-mono font-semibold">{state.reference}</span>
          </p>
          <p className="text-[9.5pt]">
            {t.doc.date}
            {lang === 'fr' ? ' : ' : ': '}
            {formatDate(state.createdAt, lang)}
          </p>
          {state.sourceSubmissionId && (
            <p className="text-[9pt] text-black/60">
              {t.doc.request} {state.sourceSubmissionId}
            </p>
          )}
        </div>
      </header>

      {(c.name || c.address || c.phone || c.email) && (
        <section className="mt-5 break-inside-avoid">
          <p className="text-[8.5pt] font-semibold uppercase tracking-[0.12em] text-black/50">{t.doc.client}</p>
          {c.name && <p className="mt-1 text-[11.5pt] font-semibold">{c.name}</p>}
          {c.address && <p>{c.address}</p>}
          {(c.phone || c.email) && <p className="text-black/70">{[c.phone, c.email].filter(Boolean).join(' · ')}</p>}
        </section>
      )}

      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className="border-b border-black/30 text-left text-[8.5pt] uppercase tracking-[0.08em] text-black/60">
            <th className="py-2 pr-3 font-semibold">{t.doc.description}</th>
            <th className="px-3 py-2 text-right font-semibold">{t.doc.quantity}</th>
            <th className="px-3 py-2 text-right font-semibold">{t.doc.unitPrice}</th>
            <th className="py-2 pl-3 text-right font-semibold">{t.doc.amount}</th>
          </tr>
        </thead>
        <tbody>
          {floorLines.map((l) => row(l, [floorDetail(state, t), rooms].filter(Boolean).join(' — ')))}
          {stairLines.length > 0 && (
            <tr className="break-inside-avoid">
              <td colSpan={4} className="pb-1 pt-3">
                <span className="font-semibold">{t.stairsLine}</span>
                <span className="text-black/60"> — {stainTag(state, t)}</span>
              </td>
            </tr>
          )}
          {stairLines.map((l) => row(l, undefined, true))}
          {extraLines.map((l) => row(l))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end break-inside-avoid">
        <dl className="w-72 text-[10pt]">
          {totalsRows(state, quote, t).map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-0.5">
              <dt className="text-black/70">{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
          <div className="mt-2 flex justify-between gap-4 border-t-2 border-primary pt-2 text-[13pt] font-bold">
            <dt>{t.total}</dt>
            <dd className="tabular-nums">{m(quote.total)}</dd>
          </div>
        </dl>
      </div>

      {state.notes.trim() && (
        <section className="mt-6 break-inside-avoid">
          <p className="text-[8.5pt] font-semibold uppercase tracking-[0.12em] text-black/50">{t.doc.notes}</p>
          <p className="mt-1 whitespace-pre-wrap">{state.notes.trim()}</p>
        </section>
      )}

      <footer className="mt-8 break-inside-avoid border-t border-black/15 pt-3 text-[9pt] text-black/60">
        {!state.taxes && <p>{t.doc.beforeTaxes}</p>}
        <p className="font-medium text-black/80">{t.doc.thanks}</p>
      </footer>
    </article>
  );
}

// ---------------------------------------------------------------------------

type Pending = { kind: 'reset' } | { kind: 'seed'; seed: QuoteSeed } | null;

export default function QuoteCalculator({ seed, onSeedConsumed }: { seed: QuoteSeed | null; onSeedConsumed: () => void }) {
  const [state, setState] = useState<CalcState>(loadDraft);
  const [pending, setPending] = useState<Pending>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const uid = useId();

  const t = TEXT[state.lang];
  const { lang } = state;
  const quote = useMemo(() => computeQuote(state), [state]);
  const m = (n: number) => formatMoney(n, lang);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    } catch {
      /* navigation privée : le calculateur fonctionne quand même */
    }
  }, [state]);

  const applySeed = (s: QuoteSeed) => {
    const fresh = createInitialState(state.lang);
    const tt = TEXT[state.lang];
    setState({
      ...fresh,
      sourceSubmissionId: s.submissionId,
      client: { name: s.name, phone: s.phone, email: s.email, address: s.address },
      floor: { ...fresh.floor, enabled: !!s.services.floor || !s.services.stairs },
      stairs: { ...fresh.stairs, enabled: !!s.services.stairs },
      extras: s.services.repair ? [{ id: newId(), label: tt.repairLine, qty: '1', rate: '' }] : [],
    });
  };

  // Arrivée depuis « Préparer le prix » d'une demande de l'historique.
  useEffect(() => {
    if (!seed) return;
    if (state.sourceSubmissionId === seed.submissionId) {
      /* même demande : on garde le travail en cours */
    } else if (hasContent(state)) setPending({ kind: 'seed', seed });
    else applySeed(seed);
    onSeedConsumed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const confirmPending = () => {
    if (pending?.kind === 'seed') applySeed(pending.seed);
    else if (pending?.kind === 'reset') setState(createInitialState(state.lang));
    setPending(null);
  };

  // --- mises à jour -------------------------------------------------------
  const setClient = (p: Partial<CalcState['client']>) => setState((s) => ({ ...s, client: { ...s.client, ...p } }));
  const setFloor = (p: Partial<CalcState['floor']>) => setState((s) => ({ ...s, floor: { ...s.floor, ...p } }));
  const setStain = (stain: boolean) =>
    setState((s) => ({ ...s, stain, floor: { ...s.floor, rate: rateString(floorRate(stain, s.floor.prefinished)) } }));
  const setPrefinished = (prefinished: boolean) =>
    setState((s) => ({ ...s, floor: { ...s.floor, prefinished, rate: rateString(floorRate(s.stain, prefinished)) } }));
  const setStairItem = (key: StairDetailKey, p: Partial<QtyRate>) =>
    setState((s) => ({
      ...s,
      stairs: { ...s.stairs, items: { ...s.stairs.items, [key]: { ...s.stairs.items[key], ...p } } },
    }));

  // Tant qu'il y a des pièces, leur somme remplace la superficie saisie à la
  // main ; celle-ci est conservée et revient si on retire toutes les pièces.
  const addRoom = () => {
    const id = newId();
    setFocusId(id);
    setState((s) => ({ ...s, floor: { ...s.floor, rooms: [...s.floor.rooms, { id, name: '', length: '', width: '' }] } }));
  };
  const setRoom = (id: string, p: Partial<CalcState['floor']['rooms'][number]>) =>
    setState((s) => ({ ...s, floor: { ...s.floor, rooms: s.floor.rooms.map((r) => (r.id === id ? { ...r, ...p } : r)) } }));
  const removeRoom = (id: string) =>
    setState((s) => ({ ...s, floor: { ...s.floor, rooms: s.floor.rooms.filter((r) => r.id !== id) } }));

  const addExtra = (label = '') => {
    const id = newId();
    setFocusId(id);
    setState((s) => ({ ...s, extras: [...s.extras, { id, label, qty: '1', rate: '' }] }));
  };
  const setExtra = (id: string, p: Partial<CalcState['extras'][number]>) =>
    setState((s) => ({ ...s, extras: s.extras.map((e) => (e.id === id ? { ...e, ...p } : e)) }));
  const removeExtra = (id: string) => setState((s) => ({ ...s, extras: s.extras.filter((e) => e.id !== id) }));

  // --- actions ------------------------------------------------------------
  const print = () => {
    // Le titre devient le nom proposé pour le PDF.
    const previous = document.title;
    document.title = `${t.doc.quote} ${state.reference}${state.client.name ? ` - ${state.client.name}` : ''}`;
    window.print();
    document.title = previous;
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText(state, quote, t));
      toast({ title: t.copied });
    } catch {
      toast({ title: t.copyFailed, variant: 'destructive' });
    }
  };

  const area = floorArea(state.floor);
  const floorAmount = quote.lines.find((l) => l.group === 'floor')?.amount ?? 0;
  const stairsAmount = quote.lines.filter((l) => l.group === 'stairs').reduce((sum, l) => sum + l.amount, 0);
  const yesNo = [
    { value: false, label: t.no },
    { value: true, label: t.yes },
  ];
  const includeToggle = (value: boolean, onChange: (v: boolean) => void, label: string) => (
    <Segmented
      label={label}
      value={value}
      onChange={onChange}
      options={[
        { value: true, label: t.include },
        { value: false, label: t.exclude },
      ]}
    />
  );

  return (
    <>
      <div className="pb-28 print:hidden lg:pb-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t.intro}</p>
            {state.sourceSubmissionId && (
              <p className="mt-2 inline-flex rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                {t.fromSubmission}&nbsp;<span className="font-mono text-foreground">{state.sourceSubmissionId}</span>
              </p>
            )}
          </div>
          <Segmented
            label={t.language}
            value={lang}
            onChange={(v) => setState((s) => ({ ...s, lang: v }))}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <Section title={t.sections.client}>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['name', 'phone', 'email', 'address'] as const).map((k) => (
                  <div key={k} className="space-y-1.5">
                    <label htmlFor={`${uid}-${k}`} className="text-xs font-medium text-muted-foreground">
                      {t.client[k]}
                    </label>
                    <Input
                      id={`${uid}-${k}`}
                      type={k === 'email' ? 'email' : k === 'phone' ? 'tel' : 'text'}
                      autoComplete="off"
                      value={state.client[k]}
                      onChange={(e) => setClient({ [k]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title={t.sections.finish}
              aside={
                <Segmented
                  label={t.sections.finish}
                  value={state.stain}
                  onChange={setStain}
                  options={[
                    { value: false, label: t.natural },
                    { value: true, label: t.stained },
                  ]}
                />
              }
            >
              {state.stain ? (
                <div className="space-y-1.5">
                  <label htmlFor={`${uid}-color`} className="text-xs font-medium text-muted-foreground">
                    {t.stainColor}
                  </label>
                  <Input
                    id={`${uid}-color`}
                    autoComplete="off"
                    placeholder={t.stainColorPh}
                    value={state.stainColor}
                    onChange={(e) => setState((s) => ({ ...s, stainColor: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">{t.stainHint}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t.stainHint}</p>
              )}
            </Section>

            <Section
              title={t.sections.floor}
              aside={includeToggle(state.floor.enabled, (enabled) => setFloor({ enabled }), t.sections.floor)}
            >
              {state.floor.enabled && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label htmlFor={`${uid}-area`} className="text-xs font-medium text-muted-foreground">
                        {t.area}
                      </label>
                      <NumberInput
                        id={`${uid}-area`}
                        value={state.floor.rooms.length ? String(area) : state.floor.area}
                        readOnly={state.floor.rooms.length > 0}
                        onChange={(v) => setFloor({ area: v })}
                        suffix={t.units.sqft}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{t.prefinished}</p>
                      <Segmented label={t.prefinished} value={state.floor.prefinished} onChange={setPrefinished} options={yesNo} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{t.rate}</p>
                      <RateInput
                        value={state.floor.rate}
                        onChange={(rate) => setFloor({ rate })}
                        defaultRate={floorRate(state.stain, state.floor.prefinished)}
                        unit="sqft"
                        label={t.sections.floor}
                        lang={lang}
                        t={t}
                      />
                    </div>
                  </div>

                  {state.floor.rooms.length > 0 && (
                    <ul className="space-y-2 rounded-lg bg-surface p-3">
                      {state.floor.rooms.map((r, i) => (
                        <li key={r.id} className="flex flex-wrap items-center gap-2">
                          <Input
                            aria-label={t.roomName}
                            placeholder={t.roomPh(i + 1)}
                            autoComplete="off"
                            autoFocus={focusId === r.id}
                            value={r.name}
                            onChange={(e) => setRoom(r.id, { name: e.target.value })}
                            className="w-full sm:w-36"
                          />
                          <NumberInput
                            ariaLabel={`${t.length} — ${r.name || t.roomPh(i + 1)}`}
                            value={r.length}
                            onChange={(length) => setRoom(r.id, { length })}
                            suffix={t.units.ft}
                            className="w-24"
                          />
                          <span className="text-muted-foreground" aria-hidden>
                            ×
                          </span>
                          <NumberInput
                            ariaLabel={`${t.width} — ${r.name || t.roomPh(i + 1)}`}
                            value={r.width}
                            onChange={(width) => setRoom(r.id, { width })}
                            suffix={t.units.ft}
                            className="w-24"
                          />
                          <span className="ml-auto min-w-[5.5rem] text-right text-sm font-medium tabular-nums">
                            {formatNumber(roomArea(r), lang)} {t.units.sqft}
                          </span>
                          <IconButton label={t.removeRoom} onClick={() => removeRoom(r.id)}>
                            <X className="h-4 w-4" aria-hidden />
                          </IconButton>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                      <Ruler className="h-4 w-4" aria-hidden /> {state.floor.rooms.length ? t.addRoom : t.measureRooms}
                    </Button>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {formatNumber(area, lang)} {t.units.sqft} × {m(parseNum(state.floor.rate))} ={' '}
                      <span className="font-semibold text-foreground">{m(floorAmount)}</span>
                    </p>
                  </div>
                </div>
              )}
            </Section>

            <Section
              title={t.sections.stairs}
              aside={includeToggle(
                state.stairs.enabled,
                (enabled) => setState((s) => ({ ...s, stairs: { ...s.stairs, enabled } })),
                t.sections.stairs,
              )}
            >
              {state.stairs.enabled && (
                <>
                  <ul className="divide-y divide-border">
                    {STAIR_KEYS.map((key) => {
                      const item = state.stairs.items[key];
                      const label = t.stairLabels[key];
                      const amount = parseNum(item.qty) * parseNum(item.rate);
                      return (
                        <li
                          key={key}
                          className="grid grid-cols-2 items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto_11rem_6rem]"
                        >
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-right text-sm font-semibold tabular-nums text-foreground sm:order-last">
                            {amount > 0 ? m(amount) : '—'}
                          </p>
                          <Stepper value={item.qty} onChange={(qty) => setStairItem(key, { qty })} label={label} t={t} />
                          <RateInput
                            value={item.rate}
                            onChange={(rate) => setStairItem(key, { rate })}
                            defaultRate={stairDefaultRate(key)}
                            unit={stairUnit(key)}
                            label={label}
                            lang={lang}
                            t={t}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-4 border-t border-border pt-3 text-right text-sm text-muted-foreground">
                    {t.sections.stairs}
                    {lang === 'fr' ? ' : ' : ': '}
                    <span className="font-semibold tabular-nums text-foreground">{m(stairsAmount)}</span>
                  </p>
                </>
              )}
            </Section>

            <Section title={t.sections.extras}>
              <div className="space-y-3">
                {state.extras.length > 0 && (
                  <ul className="space-y-2">
                    {state.extras.map((e) => (
                      <li key={e.id} className="flex flex-wrap items-center gap-2">
                        <Input
                          aria-label={t.extraPh}
                          placeholder={t.extraPh}
                          autoComplete="off"
                          autoFocus={focusId === e.id}
                          value={e.label}
                          onChange={(ev) => setExtra(e.id, { label: ev.target.value })}
                          className="w-full sm:flex-1"
                        />
                        <NumberInput
                          ariaLabel={`${t.quantity} — ${e.label || t.extraUntitled}`}
                          value={e.qty}
                          onChange={(qty) => setExtra(e.id, { qty })}
                          suffix="×"
                          className="w-20"
                        />
                        <NumberInput
                          ariaLabel={`${t.rate} — ${e.label || t.extraUntitled}`}
                          value={e.rate}
                          onChange={(rate) => setExtra(e.id, { rate })}
                          prefix={lang === 'en' ? '$' : undefined}
                          suffix={lang === 'fr' ? '$' : undefined}
                          className="w-28"
                        />
                        <span className="ml-auto min-w-[5.5rem] text-right text-sm font-semibold tabular-nums">
                          {m(parseNum(e.qty) * parseNum(e.rate))}
                        </span>
                        <IconButton label={t.removeExtra} onClick={() => removeExtra(e.id)}>
                          <X className="h-4 w-4" aria-hidden />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addExtra()}>
                    <Plus className="h-4 w-4" aria-hidden /> {t.addExtra}
                  </Button>
                  {t.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addExtra(s)}
                      className="rounded-full border border-dashed border-border-strong px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            <Section title={t.sections.adjust}>
              <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <label htmlFor={`${uid}-discount`} className="text-xs font-medium text-muted-foreground">
                    {t.discount}
                  </label>
                  <div className="flex items-center gap-2">
                    <NumberInput
                      id={`${uid}-discount`}
                      value={state.discount.value}
                      onChange={(value) => setState((s) => ({ ...s, discount: { ...s.discount, value } }))}
                      className="w-28"
                    />
                    <Segmented
                      label={t.discount}
                      value={state.discount.mode}
                      onChange={(mode) => setState((s) => ({ ...s, discount: { ...s.discount, mode } }))}
                      options={[
                        { value: 'percent', label: '%' },
                        { value: 'amount', label: '$' },
                      ]}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t.gst} {formatPercent(GST_RATE, lang)} · {t.qst} {formatPercent(QST_RATE, lang)}
                  </p>
                  <Segmented
                    label={`${t.gst} / ${t.qst}`}
                    value={state.taxes}
                    onChange={(taxes) => setState((s) => ({ ...s, taxes }))}
                    options={[
                      { value: true, label: t.taxesOn },
                      { value: false, label: t.taxesOff },
                    ]}
                  />
                </div>
              </div>
            </Section>

            <Section title={t.sections.notes}>
              <Textarea
                aria-label={t.sections.notes}
                placeholder={t.notesPh}
                rows={3}
                value={state.notes}
                onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))}
              />
            </Section>
          </div>

          {/* Résumé : colonne fixe sur ordinateur, en bas de page sur téléphone */}
          <aside ref={summaryRef} className="scroll-mt-4 lg:sticky lg:top-6">
            <div className="rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t.summary}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {state.reference} · {formatDate(state.createdAt, lang)}
                </p>
              </div>
              <div className="px-5 py-4">
                {quote.lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.empty}</p>
                ) : (
                  <ul className="space-y-2.5 text-sm">
                    {quote.lines.map((l) => (
                      <li key={l.id} className="flex justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-foreground">{lineLabel(l, t)}</span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {formatQty(l, lang, t)} × {formatRate(l, lang, t)}
                          </span>
                        </span>
                        <span className="shrink-0 font-medium tabular-nums">{m(l.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                  {totalsRows(state, quote, t).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
                  <span className="font-semibold text-foreground">{t.total}</span>
                  <span className="font-serif text-3xl font-bold tabular-nums text-foreground">{m(quote.total)}</span>
                </div>
                {!state.taxes && <p className="mt-1 text-right text-xs text-muted-foreground">{t.doc.beforeTaxes}</p>}
              </div>
              <div className="grid gap-2 border-t border-border px-5 py-4">
                <Button type="button" onClick={print} disabled={!quote.lines.length}>
                  <Printer className="h-4 w-4" aria-hidden /> {t.print}
                </Button>
                <Button type="button" variant="outline" onClick={() => void copySummary()} disabled={!quote.lines.length}>
                  <Copy className="h-4 w-4" aria-hidden /> {t.copy}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setPending({ kind: 'reset' })}>
                  <RotateCcw className="h-4 w-4" aria-hidden /> {t.newQuote}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* Téléphone : le total reste visible pendant la saisie */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t.total}</p>
              <p className="font-serif text-xl font-bold tabular-nums text-foreground">{m(quote.total)}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => summaryRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                {t.details}
              </Button>
              <Button type="button" size="sm" onClick={print} disabled={!quote.lines.length} aria-label={t.print}>
                <Printer className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PrintableQuote state={state} quote={quote} t={t} />

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">{pending?.kind === 'seed' ? t.replaceTitle : t.resetTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === 'seed' ? t.replaceBody(pending.seed.submissionId) : t.resetBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <Button onClick={confirmPending}>{t.confirm}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
