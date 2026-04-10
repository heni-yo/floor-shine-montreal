import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { COMPANY } from '../config/company.js';
import { FLOOR_RATE_PER_SQFT, PREFINISHED_FLOOR_SURCHARGE_PER_SQFT, STAIR_RATES } from '../config/pricing.js';
import type { QuotePayload } from './quoteSchema.js';
import type { EstimateResult } from './estimate.js';

const ROOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOGO_SVG_PATH = path.join(ROOT_DIR, 'public', 'logoNav.svg');
/** viewBox du logo (largeur × hauteur) pour calculer la hauteur affichée dans le PDF */
const LOGO_VIEWBOX_W = 1058;
const LOGO_VIEWBOX_H = 251;

async function loadLogoPngForPdf(): Promise<Buffer | null> {
  try {
    if (!fs.existsSync(LOGO_SVG_PATH)) {
      console.warn('[pdf] Logo SVG introuvable:', LOGO_SVG_PATH);
      return null;
    }
    return await sharp(LOGO_SVG_PATH).resize({ width: 480 }).png().toBuffer();
  } catch (e) {
    console.warn('[pdf] Impossible de convertir le logo pour le PDF:', e);
    return null;
  }
}

function formatMoneyFr(n: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

function formatDateFr(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'long',
  }).format(d);
}

function yesNoFr(v: string): string {
  if (v === 'yes') return 'Oui';
  if (v === 'no') return 'Non';
  return '—';
}

function servicesList(p: QuotePayload): string {
  const parts: string[] = [];
  if (p.services.floor) parts.push('Sablage de plancher');
  if (p.services.stairs) parts.push('Sablage d’escalier');
  if (p.services.repair) parts.push('Réparation de plancher');
  return parts.join(', ') || '—';
}

function clampText(value: string, max = 600): string {
  const v = (value ?? '').trim();
  if (v.length <= max) return v;
  return v.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function floorTypeFr(v: string): string {
  if (v === 'prefinished') return 'Préverni';
  if (v === 'regular') return 'Régulier';
  return '—';
}

function moneyOrQuote(n: number | null | undefined): string {
  if (n == null) return 'Sur devis';
  return formatMoneyFr(n);
}

function parsePositiveNumber(value: string): number | null {
  const n = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function baseFloorRatePerSqFtFr(wantColor: string): number {
  // Aligné sur buildEstimate()
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

function formatUnitPrice(n: number): string {
  // Format "35.00 $" (comme ton modèle)
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

function safePdfText(value: string): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export async function generateQuotePdf(params: {
  submissionId: string;
  createdAt: Date;
  payload: QuotePayload;
  estimate: EstimateResult;
}): Promise<Buffer> {
  const { submissionId, createdAt, payload, estimate } = params;
  const logoPng = await loadLogoPngForPdf();

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    // Objectif: UNE seule page A4, style administratif (noir/blanc, bordures)
    const doc = new PDFDocument({
      size: 'A4',
      margin: 24,
      info: { Title: `Soumission ${submissionId}` },
    });
    doc.on('data', (c) => chunks.push(c as Buffer));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const top = doc.page.margins.top;
    const bottom = doc.page.height - doc.page.margins.bottom;
    let y = top;

    // Helpers de dessin (tableaux style "modèle")
    const stroke = (color = '#444444', width = 0.8) => {
      doc.lineWidth(width).strokeColor(color);
    };

    const fill = (color = '#ffffff') => {
      doc.fillColor(color);
    };

    const cell = (args: {
      x: number;
      y: number;
      w: number;
      h: number;
      text?: string;
      align?: 'left' | 'right' | 'center';
      valign?: 'top' | 'middle';
      bold?: boolean;
      size?: number;
      padX?: number;
      padY?: number;
    }) => {
      const padX = args.padX ?? 6;
      const padY = args.padY ?? 5;
      stroke('#555555', 0.8);
      doc.rect(args.x, args.y, args.w, args.h).stroke();
      const content = safePdfText(args.text ?? '');
      doc.font(args.bold ? 'Helvetica-Bold' : 'Helvetica');
      doc.fontSize(args.size ?? 10);
      doc.fillColor('#111111');
      const textY = args.valign === 'middle' ? args.y + Math.max(0, (args.h - (args.size ?? 10)) / 2 - 2) : args.y + padY;
      doc.text(content, args.x + padX, textY, {
        width: args.w - padX * 2,
        align: args.align ?? 'left',
        height: args.h - padY * 2,
        ellipsis: true,
      });
    };

    const cellLines = (args: {
      x: number;
      y: number;
      w: number;
      h: number;
      lines: string[];
      size?: number;
      bold?: boolean;
      padX?: number;
      padY?: number;
      lineGap?: number;
      align?: 'left' | 'right' | 'center';
    }) => {
      const padX = args.padX ?? 6;
      const padY = args.padY ?? 8;
      const size = args.size ?? 9;
      const lineGap = args.lineGap ?? 5;
      stroke('#555555', 0.8);
      doc.rect(args.x, args.y, args.w, args.h).stroke();
      doc.font(args.bold ? 'Helvetica-Bold' : 'Helvetica');
      doc.fontSize(size);
      doc.fillColor('#111111');

      const maxW = args.w - padX * 2;
      let yy = args.y + padY;
      const bottomLimit = args.y + args.h - 2;

      for (const raw of args.lines) {
        const line = safePdfText(raw);
        if (yy >= bottomLimit) break;
        doc.text(line, args.x + padX, yy, {
          width: maxW,
          align: args.align ?? 'left',
          ellipsis: true,
          lineBreak: false,
        });
        // PDFKit met doc.y sous le texte dessiné — indispensable pour éviter le chevauchement vertical
        yy = doc.y + lineGap;
      }
    };

    const row = (x: number, yy: number, widths: number[], h: number) => {
      let xx = x;
      const cells: { x: number; y: number; w: number; h: number }[] = [];
      for (const w of widths) {
        cells.push({ x: xx, y: yy, w, h });
        xx += w;
      }
      return cells;
    };

    // -------------------------------------------------------------------
    // 1) EN-TÊTE EN 3 BLOCS HORIZONTAUX (bordures fines)
    // -------------------------------------------------------------------
    const headerH = 96;
    const headerY = y;
    const headerW = pageWidth;
    // Colonne logo plus large pour permettre un logo plus grand (le ratio 28 % plafonnait ~141 pt de large)
    const colL = Math.floor(headerW * 0.36);
    const colR = Math.floor(headerW * 0.2);
    const colC = headerW - colL - colR;
    const headerCells = row(left, headerY, [colL, colC, colR], headerH);

    // Cellule gauche: logo
    cell({ ...headerCells[0], text: '', padX: 6, padY: 6 });
    if (logoPng) {
      const maxW = colL - 12;
      const maxH = headerH - 12;
      const desiredW = Math.min(maxW, 260);
      const desiredH = (desiredW * LOGO_VIEWBOX_H) / LOGO_VIEWBOX_W;
      const imgH = Math.min(desiredH, maxH);
      const imgW = (imgH * LOGO_VIEWBOX_W) / LOGO_VIEWBOX_H;
      doc.image(logoPng, headerCells[0].x + 6, headerCells[0].y + 8, { width: imgW, height: imgH });
    } else {
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#111');
      doc.text(COMPANY.legalName, headerCells[0].x + 8, headerCells[0].y + 10, { width: colL - 16 });
    }

    // Cellule centre: titre "ESTIMATION" puis "Sablage de plancher"
    cell({ ...headerCells[1], text: '', padX: 6, padY: 6 });
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#111');
    doc.text('ESTIMATION', headerCells[1].x, headerCells[1].y + 18, {
      width: colC,
      align: 'center',
    });
    doc.font('Helvetica').fontSize(11).fillColor('#111');
    doc.text('Sablage de plancher', headerCells[1].x, headerCells[1].y + 42, { width: colC, align: 'center' });

    // Cellule droite: estimation # et date YYYY-MM-DD
    const dateIso = new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(createdAt)
      .replace(/\//g, '-');
    const desiredDateIso = safePdfText(payload.date || '');
    cellLines({
      ...headerCells[2],
      lines: [
        `Estimation #${submissionId}`,
        `Date : ${dateIso}`,
        'Travaux désirés :',
        desiredDateIso || '—',
      ],
      size: 8.5,
      padX: 6,
      padY: 8,
      lineGap: 6,
      align: 'left',
    });

    y = headerY + headerH + 10;

    // -------------------------------------------------------------------
    // 2) DEUXIÈME SECTION : INFORMATIONS (zone encadrée 2 colonnes)
    // -------------------------------------------------------------------
    const infoH = 86;
    const infoY = y;
    const infoW = pageWidth;
    const infoColL = Math.floor(infoW * 0.5);
    const infoColR = infoW - infoColL;
    const infoCells = row(left, infoY, [infoColL, infoColR], infoH);

    // Cadre externe (même si on dessine les cellules, ça renforce le modèle)
    stroke('#555555', 0.9);
    doc.rect(left, infoY, infoW, infoH).stroke();
    doc.moveTo(left + infoColL, infoY).lineTo(left + infoColL, infoY + infoH).stroke();

    // Gauche: données client (organisées, compactes)
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
    cell({ ...infoCells[0], text: clientBlock, size: 9, padX: 8, padY: 7 });

    // Droite: entrepreneur (format demandé)
    const entBlock =
      `L'ENTREPRENEUR\n` +
      `${COMPANY.legalName}\n` +
      `${COMPANY.cityLine}\n` +
      `Tél: ${COMPANY.phone.replace(/-/g, ' ')}\n` +
      `${COMPANY.email}`;
    cell({ ...infoCells[1], text: entBlock, size: 10, padX: 8, padY: 8 });

    y = infoY + infoH + 12;

    // -------------------------------------------------------------------
    // 3) TITRE SECTION PRIX (ligne pleine largeur, bordure haut/bas)
    // -------------------------------------------------------------------
    const priceTitleH = 22;
    stroke('#555555', 0.9);
    doc.rect(left, y, pageWidth, priceTitleH).stroke();
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111');
    doc.text('Prix estimé', left + 8, y + 6, { width: pageWidth - 16, align: 'left' });
    y += priceTitleH;

    // -------------------------------------------------------------------
    // 4-6) TABLEAU PRINCIPAL + lignes escaliers + sous-total (format modèle)
    // -------------------------------------------------------------------
    const tableY = y;
    const tableW = pageWidth;
    const th = 22;
    const rh = 22;

    // Colonnes: Service | Quantité | Prix unitaire | Total
    const wService = Math.floor(tableW * 0.52);
    const wQty = Math.floor(tableW * 0.16);
    const wUnit = Math.floor(tableW * 0.16);
    const wTotal = tableW - wService - wQty - wUnit;
    const widths = [wService, wQty, wUnit, wTotal];

    // Header row
    const headCells = row(left, y, widths, th);
    doc.save();
    fill('#f2f2f2');
    doc.rect(left, y, tableW, th).fill();
    doc.restore();
    cell({ ...headCells[0], text: 'Service', bold: true, size: 10, valign: 'middle' });
    cell({ ...headCells[1], text: 'Quantité', bold: true, size: 10, valign: 'middle', align: 'center' });
    cell({ ...headCells[2], text: 'Prix unitaire', bold: true, size: 10, valign: 'middle', align: 'center' });
    cell({ ...headCells[3], text: 'Total', bold: true, size: 10, valign: 'middle', align: 'center' });
    y += th;

    // Ligne principale plancher (toujours affichée comme modèle; colonnes vides si non applicable)
    const floorCells = row(left, y, widths, rh);
    const sqft = parsePositiveNumber(payload.area);
    const qtyFloor = payload.services.floor ? `${formatNumber(sqft ?? 0)}` : '0';
    const unitFloor = payload.services.floor ? formatUnitPrice(unitRateFloor(payload)) : '';
    const floorAmount = estimate.lines.find((l) => /Sablage de plancher/i.test(l.description))?.amount ?? null;
    const floorNumeric = payload.services.floor && floorAmount != null ? floorAmount : 0;
    const totalFloor = payload.services.floor ? (floorAmount == null ? 'Sur devis' : moneyOrQuote(floorAmount)) : formatTotal(0);
    cell({
      ...floorCells[0],
      text: 'Pieds carrés de Finitec Ex-Duo+ et/ou finitec Ex-Tech',
      size: 10,
    });
    cell({ ...floorCells[1], text: qtyFloor, size: 10, align: 'center' });
    cell({ ...floorCells[2], text: unitFloor, size: 10, align: 'center' });
    cell({ ...floorCells[3], text: totalFloor, size: 10, align: 'right' });
    y += rh;

    // Ligne Réparation du plancher (toujours affichée) :
    // - Quantité: Oui/Non (au lieu de 1/0)
    // - Total: Sur devis si Oui, sinon 0.00 $
    {
      const repairCells = row(left, y, widths, rh);
      const repairYes = payload.services.repair === true;
      cell({ ...repairCells[0], text: 'Réparation du plancher', size: 10 });
      cell({ ...repairCells[1], text: repairYes ? 'Oui' : 'Non', size: 10, align: 'center' });
      cell({ ...repairCells[2], text: '', size: 10, align: 'center' });
      cell({ ...repairCells[3], text: repairYes ? 'Sur devis' : formatTotal(0), size: 10, align: 'right' });
      y += rh;
    }

    // 5) LIGNES SUPPLÉMENTAIRES ESCALIERS (format modèle, unit prices fixes)
    type StairLine = { label: string; key: keyof typeof STAIR_RATES; unit: number; qtyText?: string; totalText?: string };
    const stairMap: StairLine[] = [
      { label: 'Marches', key: 'marches', unit: 35.0 },
      { label: 'Contremarches', key: 'contremarches', unit: 30.0 },
      { label: 'Pieds linéaire main courante', key: 'mainCourante', unit: 15.0 },
      { label: 'Pieds linéaires limon', key: 'limon', unit: 15.0 },
      { label: 'Pieds linéaires faux limon', key: 'fauxLimon', unit: 15.0 },
      { label: 'Barreaux', key: 'barreaux', unit: 10.0 },
      { label: 'Poteaux', key: 'poteaux', unit: 80.0 },
    ];

    let stairsTotal = 0;
    let stairsAnySelected = payload.services.stairs;
    for (const sl of stairMap) {
      const qty = payload.services.stairs ? parseQty(payload.stairDetails?.[sl.key]) : 0;
      const lineTotal = Math.round(qty * sl.unit * 100) / 100;
      if (payload.services.stairs) stairsTotal += lineTotal;

      const cells = row(left, y, widths, rh);
      cell({ ...cells[0], text: sl.label, size: 10 });
      cell({ ...cells[1], text: payload.services.stairs ? formatNumber(qty) : '0', size: 10, align: 'center' });
      cell({ ...cells[2], text: formatUnitPrice(sl.unit), size: 10, align: 'center' });
      cell({ ...cells[3], text: payload.services.stairs ? formatTotal(lineTotal) : formatTotal(0), size: 10, align: 'right' });
      y += rh;
    }

    // 6) SOUS-TOTAL (texte à droite dans avant-dernière cellule, montant dans dernière)
    const subtotalCells = row(left, y, widths, rh);
    // Cadres des cellules
    cell({ ...subtotalCells[0], text: '', size: 10 });
    cell({ ...subtotalCells[1], text: '', size: 10 });
    cell({ ...subtotalCells[2], text: 'Sous-total', bold: true, size: 10, align: 'right' });
    // Sous-total = total plancher numérique + total escaliers (si sélectionné). Les lignes "Sur devis" n'entrent pas dans le calcul.
    const computedSubtotal = floorNumeric + (stairsAnySelected ? stairsTotal : 0);
    cell({ ...subtotalCells[3], text: formatTotal(computedSubtotal), bold: true, size: 10, align: 'right' });
    y += rh;

    // Cadre externe tableau complet (renforce l’aspect rectangulaire)
    stroke('#555555', 0.9);
    doc.rect(left, tableY, tableW, y - tableY).stroke();

    // -------------------------------------------------------------------
    // 7) BAS DE PAGE (description / besoins) + certification (pied fixe)
    // -------------------------------------------------------------------
    const certReserve = 34;
    y += 14;
    const footerY = Math.min(y, bottom - 70 - certReserve);
    doc.font('Helvetica').fontSize(10).fillColor('#111');
    const detailsText = clampText(payload.details ?? '', 220);
    const specialText = clampText(payload.specialNeeds ?? '', 220);
    doc.text(`Description détaillée : ${detailsText || '—'}`, left, footerY, { width: pageWidth, align: 'left' });
    stroke('#555555', 0.8);
    doc.moveTo(left, footerY + 16).lineTo(left + pageWidth, footerY + 16).stroke();

    doc.text(`Besoins particuliers : ${specialText || '—'}`, left, footerY + 28, { width: pageWidth, align: 'left' });
    doc.moveTo(left, footerY + 44).lineTo(left + pageWidth, footerY + 44).stroke();

    // Certification Talon Plancher — pied de page (centré, ne chevauche pas le bloc du dessus)
    const certLines = [...COMPANY.pdfCertificationLines];
    if (certLines.length > 0) {
      doc.font('Helvetica').fontSize(8).fillColor('#333333');
      let certY = bottom - certReserve + 4;
      for (const line of certLines) {
        doc.text(line, left, certY, { width: pageWidth, align: 'center', lineGap: 1 });
        certY += 9.5;
      }
    }

    doc.end();
  });
}
