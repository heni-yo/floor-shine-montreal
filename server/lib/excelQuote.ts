import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import sharp from 'sharp';
import {
  FLOOR_RATE_PER_SQFT,
  PREFINISHED_FLOOR_SURCHARGE_PER_SQFT,
  type StairDetailKey,
} from '../config/pricing.js';
import { COMPANY } from '../config/company.js';
import type { QuotePayload } from './quoteSchema.js';
import type { EstimateResult } from './estimate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..');
const LOGO_SVG_PATH = path.join(ROOT_DIR, 'public', 'logoNav.svg');
/** Même ratio que le PDF (`pdfQuote.ts`) pour dimensionner l’image. */
const LOGO_VIEWBOX_W = 1058;
const LOGO_VIEWBOX_H = 251;

async function loadLogoPngForExcel(): Promise<Buffer | null> {
  try {
    if (!fs.existsSync(LOGO_SVG_PATH)) {
      console.warn('[excel] Logo SVG introuvable:', LOGO_SVG_PATH);
      return null;
    }
    return await sharp(LOGO_SVG_PATH).resize({ width: 420 }).png().toBuffer();
  } catch (e) {
    console.warn('[excel] Impossible de convertir le logo pour Excel:', e);
    return null;
  }
}

const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FF555555' } },
  left: { style: 'thin', color: { argb: 'FF555555' } },
  bottom: { style: 'thin', color: { argb: 'FF555555' } },
  right: { style: 'thin', color: { argb: 'FF555555' } },
};

function safeText(value: string): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function clampText(value: string, max = 600): string {
  const v = (value ?? '').trim();
  if (v.length <= max) return v;
  return v.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function parsePositiveNumber(value: string): number | null {
  const n = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function baseFloorRatePerSqFtFr(wantColor: string): number {
  const color = wantColor === 'yes';
  if (color) return FLOOR_RATE_PER_SQFT.colorNoVarnish;
  return FLOOR_RATE_PER_SQFT.noColorNoVarnish;
}

function unitRateFloor(payload: QuotePayload): number {
  const base = baseFloorRatePerSqFtFr(payload.wantColor);
  const prefinished = payload.floorType === 'prefinished';
  return prefinished ? base + PREFINISHED_FLOOR_SURCHARGE_PER_SQFT : base;
}

function parseQty(value: string | undefined): number {
  if (value == null || !String(value).trim()) return 0;
  const n = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function formatMoneyFr(n: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

function moneyOrQuote(n: number | null | undefined): string {
  if (n == null) return 'Sur devis';
  return formatMoneyFr(n);
}

function formatUnitPrice(n: number): string {
  const v = (Math.round(n * 100) / 100).toFixed(2);
  return `${v} $`;
}

function formatTotal(n: number): string {
  const v = (Math.round(n * 100) / 100).toFixed(2);
  return `${v} $`;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '';
  const v = Math.round(n * 100) / 100;
  return String(v).replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1');
}

/** Aligné sur `pdfQuote.ts` — mêmes libellés et mêmes tarifs d’escalier. */
const STAIR_LINES: { label: string; key: StairDetailKey; unit: number }[] = [
  { label: 'Marches', key: 'marches', unit: 35.0 },
  { label: 'Contremarches', key: 'contremarches', unit: 30.0 },
  { label: 'Pieds linéaire main courante', key: 'mainCourante', unit: 15.0 },
  { label: 'Pieds linéaires limon', key: 'limon', unit: 15.0 },
  { label: 'Pieds linéaires faux limon', key: 'fauxLimon', unit: 15.0 },
  { label: 'Barreaux', key: 'barreaux', unit: 10.0 },
  { label: 'Poteaux', key: 'poteaux', unit: 80.0 },
];

function applyBorderToRange(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
): void {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      sheet.getCell(r, c).border = BORDER;
    }
  }
}

export async function generateQuoteExcel(params: {
  submissionId: string;
  createdAt: Date;
  payload: QuotePayload;
  estimate: EstimateResult;
}): Promise<Buffer> {
  const { submissionId, createdAt, payload, estimate } = params;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY.legalName;
  const sheet = workbook.addWorksheet('Soumission', {
    views: [{ showGridLines: false }],
  });

  /** 5 colonnes : A–B logo, C–D titre (largeur suffisante pour « ESTIMATION »), E métadonnées ; le tableau utilise A–D. */
  sheet.columns = [
    { width: 14 },
    { width: 14 },
    { width: 15 },
    { width: 15 },
    { width: 22 },
  ];

  const dateIso = new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(createdAt)
    .replace(/\//g, '-');
  const desiredDateIso = safeText(payload.date || '');

  // ----- 1) En-tête (3 blocs alignés sur le PDF : logo | titre | infos) -----
  for (let i = 1; i <= 4; i++) {
    sheet.getRow(i).height = 27;
  }

  const logoBuf = await loadLogoPngForExcel();
  sheet.mergeCells('A1:B4');
  applyBorderToRange(sheet, 1, 4, 1, 2);
  if (logoBuf) {
    const logoId = workbook.addImage({ buffer: logoBuf, extension: 'png' });
    const imgW = 260;
    const imgH = (imgW * LOGO_VIEWBOX_H) / LOGO_VIEWBOX_W;
    sheet.addImage(logoId, {
      tl: { col: 0.15, row: 0.08 },
      ext: { width: imgW, height: imgH },
    });
  } else {
    const logoCell = sheet.getCell('A1');
    logoCell.value = COMPANY.legalName;
    logoCell.font = { bold: true, size: 12 };
    logoCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  }

  const centerCell = sheet.getCell('C1');
  centerCell.value = {
    richText: [
      { font: { bold: true, size: 16 }, text: 'ESTIMATION' },
      { font: { size: 11 }, text: '\nSablage de plancher' },
    ],
  };
  centerCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.mergeCells('C1:D4');
  applyBorderToRange(sheet, 1, 4, 3, 4);

  const rightBlock =
    `Estimation #${submissionId}\n` +
    `Date : ${dateIso}\n` +
    'Travaux désirés :\n' +
    (desiredDateIso || '—');
  const rightCell = sheet.getCell('E1');
  rightCell.value = rightBlock;
  rightCell.font = { size: 11 };
  rightCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  sheet.mergeCells('E1:E4');
  applyBorderToRange(sheet, 1, 4, 5, 5);

  // ----- 2) Informations client / entrepreneur -----
  const clientName = `${payload.firstName} ${payload.lastName}`.trim();
  const clientPhone = payload.phone?.trim() ?? '';
  const clientAddr = `${payload.address}, ${payload.city} ${payload.postalCode}`.trim();
  const clientEmail = payload.email?.trim() ?? '';
  const clientBlock =
    `Les données du client :\n` +
    `Nom : ${clientName}\n` +
    `Téléphone : ${clientPhone}\n` +
    `Adresse : ${clientAddr}\n` +
    `Courriel : ${clientEmail}`;

  const entBlock =
    `L'ENTREPRENEUR\n` +
    `${COMPANY.legalName}\n` +
    `${COMPANY.cityLine}\n` +
    `Tél: ${COMPANY.phone.replace(/-/g, ' ')}\n` +
    `${COMPANY.email}`;

  sheet.getCell('A6').value = clientBlock;
  sheet.getCell('A6').font = { size: 9 };
  sheet.getCell('A6').alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  sheet.mergeCells('A6:B12');
  applyBorderToRange(sheet, 6, 12, 1, 2);

  sheet.getCell('C6').value = entBlock;
  sheet.getCell('C6').font = { size: 10 };
  sheet.getCell('C6').alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  sheet.mergeCells('C6:D12');
  applyBorderToRange(sheet, 6, 12, 3, 4);

  // ----- 3) Titre « Prix estimé » -----
  const priceTitle = sheet.getCell('A14');
  priceTitle.value = 'Prix estimé';
  priceTitle.font = { bold: true, size: 11 };
  priceTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.mergeCells('A14:E14');
  applyBorderToRange(sheet, 14, 14, 1, 5);

  // ----- 4) Tableau (même logique que pdfQuote) -----
  const headRow = 15;
  const headers = ['Service', 'Quantité', 'Prix unitaire', 'Total'];
  for (let c = 0; c < 4; c++) {
    const cell = sheet.getCell(headRow, c + 1);
    cell.value = headers[c];
    cell.font = { bold: true, size: 10 };
    cell.alignment = {
      vertical: 'middle',
      horizontal: c === 0 ? 'left' : 'center',
      wrapText: true,
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' },
    };
    cell.border = BORDER;
  }

  let r = headRow + 1;

  const sqft = parsePositiveNumber(payload.area);
  const qtyFloor = payload.services.floor ? `${formatNumber(sqft ?? 0)}` : '0';
  const unitFloor = payload.services.floor ? formatUnitPrice(unitRateFloor(payload)) : '';
  const floorAmount = estimate.lines.find((l) => /Sablage de plancher/i.test(l.description))?.amount ?? null;
  const floorNumeric = payload.services.floor && floorAmount != null ? floorAmount : 0;
  const totalFloor = payload.services.floor
    ? floorAmount == null
      ? 'Sur devis'
      : moneyOrQuote(floorAmount)
    : formatTotal(0);

  sheet.getCell(r, 1).value = 'Pieds carrés de Finitec Ex-Duo+ et/ou finitec Ex-Tech';
  sheet.getCell(r, 2).value = qtyFloor;
  sheet.getCell(r, 3).value = unitFloor;
  sheet.getCell(r, 4).value = totalFloor;
  for (let c = 1; c <= 4; c++) {
    sheet.getCell(r, c).font = { size: 10 };
    sheet.getCell(r, c).alignment = {
      vertical: 'middle',
      horizontal: c === 1 ? 'left' : c === 4 ? 'right' : 'center',
      wrapText: true,
    };
    sheet.getCell(r, c).border = BORDER;
  }
  r += 1;

  const repairYes = payload.services.repair === true;
  sheet.getCell(r, 1).value = 'Réparation du plancher';
  sheet.getCell(r, 2).value = repairYes ? 'Oui' : 'Non';
  sheet.getCell(r, 3).value = '';
  sheet.getCell(r, 4).value = repairYes ? 'Sur devis' : formatTotal(0);
  for (let c = 1; c <= 4; c++) {
    sheet.getCell(r, c).font = { size: 10 };
    sheet.getCell(r, c).alignment = {
      vertical: 'middle',
      horizontal: c === 1 ? 'left' : c === 4 ? 'right' : 'center',
      wrapText: true,
    };
    sheet.getCell(r, c).border = BORDER;
  }
  r += 1;

  let stairsTotal = 0;
  const stairsAnySelected = payload.services.stairs;
  for (const sl of STAIR_LINES) {
    const qty = payload.services.stairs ? parseQty(payload.stairDetails?.[sl.key]) : 0;
    const lineTotal = Math.round(qty * sl.unit * 100) / 100;
    if (payload.services.stairs) stairsTotal += lineTotal;

    sheet.getCell(r, 1).value = sl.label;
    sheet.getCell(r, 2).value = payload.services.stairs ? formatNumber(qty) : '0';
    sheet.getCell(r, 3).value = formatUnitPrice(sl.unit);
    sheet.getCell(r, 4).value = payload.services.stairs ? formatTotal(lineTotal) : formatTotal(0);
    for (let c = 1; c <= 4; c++) {
      sheet.getCell(r, c).font = { size: 10 };
      sheet.getCell(r, c).alignment = {
        vertical: 'middle',
        horizontal: c === 1 ? 'left' : c === 4 ? 'right' : 'center',
        wrapText: true,
      };
      sheet.getCell(r, c).border = BORDER;
    }
    r += 1;
  }

  const computedSubtotal = floorNumeric + (stairsAnySelected ? stairsTotal : 0);
  sheet.getCell(r, 1).value = '';
  sheet.getCell(r, 2).value = '';
  sheet.getCell(r, 3).value = 'Sous-total';
  sheet.getCell(r, 3).font = { bold: true, size: 10 };
  sheet.getCell(r, 3).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
  sheet.getCell(r, 4).value = formatTotal(computedSubtotal);
  sheet.getCell(r, 4).font = { bold: true, size: 10 };
  sheet.getCell(r, 4).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
  for (let c = 1; c <= 4; c++) {
    sheet.getCell(r, c).border = BORDER;
  }
  r += 2;

  // ----- 5) Pied de page (comme le PDF) -----
  const detailsText = clampText(payload.details ?? '', 220);
  const specialText = clampText(payload.specialNeeds ?? '', 220);
  sheet.getCell(r, 1).value = `Description détaillée : ${detailsText || '—'}`;
  sheet.getCell(r, 1).font = { size: 10 };
  sheet.mergeCells(`A${r}:E${r}`);
  sheet.getRow(r).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
  r += 1;

  sheet.getRow(r).height = 2;
  r += 1;

  sheet.getCell(r, 1).value = `Besoins particuliers : ${specialText || '—'}`;
  sheet.getCell(r, 1).font = { size: 10 };
  sheet.mergeCells(`A${r}:E${r}`);
  sheet.getRow(r).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
  r += 2;

  for (const line of COMPANY.pdfCertificationLines) {
    sheet.getCell(r, 1).value = line;
    sheet.getCell(r, 1).font = { size: 8, color: { argb: 'FF333333' } };
    sheet.mergeCells(`A${r}:E${r}`);
    sheet.getCell(r, 1).alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
    r += 1;
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.from(buf);
}
