import {
  FLOOR_RATE_PER_SQFT,
  PREFINISHED_FLOOR_SURCHARGE_PER_SQFT,
  STAIR_RATES,
  type StairDetailKey,
} from '../config/pricing.js';
import type { QuotePayload } from './quoteSchema.js';

export type EstimateLine = {
  description: string;
  detail: string;
  amount: number | null;
};

export type EstimateResult = {
  lines: EstimateLine[];
  subtotal: number | null;
  notes: string[];
};

function parsePositiveNumber(value: string): number | null {
  const n = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Quantité pour escalier : 0 si vide / invalide ; accepte les décimales (pi lin.). */
function parseQty(value: string | undefined): number {
  if (value == null || !String(value).trim()) return 0;
  const n = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/** Tarif de base au pi² selon la teinte ; le supplément préverni est appliqué séparément. */
function baseFloorRatePerSqFt(wantColor: string): number {
  const color = wantColor === 'yes';
  if (color) return FLOOR_RATE_PER_SQFT.colorNoVarnish;
  return FLOOR_RATE_PER_SQFT.noColorNoVarnish;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

function computeStairEstimate(sd: QuotePayload['stairDetails']): { lines: EstimateLine[]; total: number } {
  const lines: EstimateLine[] = [];
  let total = 0;

  (Object.keys(STAIR_RATES) as StairDetailKey[]).forEach((key) => {
    const cfg = STAIR_RATES[key];
    const qty = parseQty(sd[key]);
    if (qty <= 0) return;
    const amount = Math.round(qty * cfg.ratePerUnit * 100) / 100;
    total += amount;
    const detail =
      cfg.per === 'pi_lin'
        ? `${qty} pi lin. × ${formatMoney(cfg.ratePerUnit)}`
        : `${qty} unité(s) × ${formatMoney(cfg.ratePerUnit)}`;
    lines.push({
      description: `Escalier — ${cfg.label}`,
      detail,
      amount,
    });
  });

  return { lines, total: Math.round(total * 100) / 100 };
}

export function buildEstimate(payload: QuotePayload): EstimateResult {
  const lines: EstimateLine[] = [];
  const notes: string[] = [];
  let subtotal = 0;
  let hasNumericTotal = false;

  const sqft = parsePositiveNumber(payload.area);

  if (payload.services.floor) {
    const baseRate = baseFloorRatePerSqFt(payload.wantColor);
    const prefinished = payload.floorType === 'prefinished';
    const effectiveRate = prefinished ? baseRate + PREFINISHED_FLOOR_SURCHARGE_PER_SQFT : baseRate;
    const colorLabel = payload.wantColor === 'yes' ? 'Oui' : payload.wantColor === 'no' ? 'Non' : 'Non précisé';
    const floorTypeLabel =
      payload.floorType === 'prefinished'
        ? 'Préverni'
        : payload.floorType === 'regular'
          ? 'Régulier'
          : '—';

    if (sqft != null) {
      const amount = Math.round(sqft * effectiveRate * 100) / 100;
      subtotal += amount;
      hasNumericTotal = true;
      const detailParts = [
        `${sqft} pi² × ${formatMoney(effectiveRate)}/pi²`,
        `type: ${floorTypeLabel}`,
        `teinte: ${colorLabel}`,
      ];
      if (prefinished) {
        detailParts.push(
          `dont supplément préverni ${formatMoney(PREFINISHED_FLOOR_SURCHARGE_PER_SQFT)}/pi²`,
        );
      }
      lines.push({
        description: 'Sablage de plancher (estimation)',
        detail: detailParts.join(' — '),
        amount,
      });
    } else {
      lines.push({
        description: 'Sablage de plancher (estimation)',
        detail: `Superficie non numérique — type: ${floorTypeLabel} — teinte: ${colorLabel} — tarif indicatif ${formatMoney(effectiveRate)}/pi²${prefinished ? ` (incl. supplément préverni ${formatMoney(PREFINISHED_FLOOR_SURCHARGE_PER_SQFT)}/pi²)` : ''}`,
        amount: null,
      });
      notes.push('Superficie invalide ou absente pour le calcul automatique.');
    }
  }

  if (payload.services.stairs) {
    const { lines: stairLines, total: stairTotal } = computeStairEstimate(payload.stairDetails);

    if (stairLines.length > 0) {
      lines.push(...stairLines);
      subtotal += stairTotal;
      hasNumericTotal = true;
    } else {
      lines.push({
        description: 'Sablage d’escalier',
        detail: 'Quantités non indiquées — précisez marches, contremarches, pi lin., etc., pour une estimation',
        amount: null,
      });
    }
  }

  if (payload.services.repair) {
    lines.push({
      description: 'Réparation de plancher',
      detail: 'Selon l’étendue des travaux — visite recommandée',
      amount: null,
    });
  }

  if (!payload.services.floor && !payload.services.stairs && !payload.services.repair) {
    lines.push({ description: 'Services', detail: 'Aucun service sélectionné', amount: null });
  }

  return {
    lines,
    subtotal: hasNumericTotal ? Math.round(subtotal * 100) / 100 : null,
    notes,
  };
}
