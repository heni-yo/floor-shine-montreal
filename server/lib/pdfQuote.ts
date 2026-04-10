import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { COMPANY } from '../config/company.js';
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
    return await sharp(LOGO_SVG_PATH).resize({ width: 320 }).png().toBuffer();
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
    const doc = new PDFDocument({ size: 'LETTER', margin: 48, info: { Title: `Soumission ${submissionId}` } });
    doc.on('data', (c) => chunks.push(c as Buffer));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let y = doc.y;

    const line = (text: string, opts?: { bold?: boolean; size?: number; color?: string }) => {
      doc.fontSize(opts?.size ?? 10);
      doc.fillColor(opts?.color ?? '#111111');
      if (opts?.bold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      doc.text(text, doc.page.margins.left, y, { width: pageWidth, lineGap: 2 });
      y = doc.y + 4;
    };

    // En-tête (logo vectoriel → PNG via sharp, car PDFKit ne gère pas le SVG)
    const left = doc.page.margins.left;
    if (logoPng) {
      const logoW = 132;
      const logoH = (logoW * LOGO_VIEWBOX_H) / LOGO_VIEWBOX_W;
      doc.image(logoPng, left, y, { width: logoW, height: logoH });
      y += logoH + 10;
    } else {
      doc.font('Helvetica-Bold').fontSize(20).fillColor('#1a1a1a');
      doc.text(COMPANY.legalName, left, y);
      y = doc.y + 6;
    }
    line(`${COMPANY.cityLine} · ${COMPANY.phone}`, { size: 10 });
    line(COMPANY.email, { size: 10 });
    y += 8;

    doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.margins.left + pageWidth, y).stroke('#cccccc');
    y += 14;

    line('SOUMISSION / ESTIMATION', { bold: true, size: 16 });
    y += 4;
    line(`No ${submissionId}`, { bold: true, size: 11 });
    line(`Date : ${new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' }).format(createdAt)}`, { size: 10 });
    line(`Date souhaitée des travaux : ${formatDateFr(payload.date)}`, { size: 10 });
    y += 10;

    line('Client', { bold: true, size: 12 });
    line(`${payload.firstName} ${payload.lastName}`);
    line(`Téléphone : ${payload.phone}`);
    line(`Courriel : ${payload.email}`);
    line(`Adresse : ${payload.address}, ${payload.city} ${payload.postalCode}`);
    y += 8;

    line('Services demandés', { bold: true, size: 12 });
    line(servicesList(payload));
    if (payload.services.floor) {
      line(
        `Type de plancher : ${
          payload.floorType === 'prefinished'
            ? 'Préverni'
            : payload.floorType === 'regular'
              ? 'Régulier'
              : 'Non précisé'
        }`,
      );
    }
    line(`Superficie approximative : ${payload.area} pi²`);
    line(`Teinte / couleur : ${yesNoFr(payload.wantColor)}`);
    y += 6;

    if (payload.services.stairs) {
      line('Détails escalier', { bold: true, size: 11 });
      const s = payload.stairDetails;
      line(`Marches : ${s.marches || '—'}`);
      line(`Contremarches : ${s.contremarches || '—'}`);
      line(`Main courante : ${s.mainCourante || '—'}`);
      line(`Limon (pi lin.) : ${s.limon || '—'}`);
      line(`Faux limon (pi lin.) : ${s.fauxLimon || '—'}`);
      line(`Barreaux : ${s.barreaux || '—'}`);
      line(`Poteaux : ${s.poteaux || '—'}`);
      y += 6;
    }

    if (payload.details?.trim()) {
      line('Description détaillée', { bold: true, size: 11 });
      line(payload.details.trim(), { size: 10 });
      y += 6;
    }

    if (payload.specialNeeds?.trim()) {
      line('Besoins particuliers', { bold: true, size: 11 });
      line(payload.specialNeeds.trim(), { size: 10 });
      y += 6;
    }

    // Tableau récapitulatif
    line('Récapitulatif et prix estimé', { bold: true, size: 12 });
    y += 4;

    const colDesc = doc.page.margins.left;
    const colAmt = doc.page.margins.left + pageWidth * 0.72;
    const tableWidth = pageWidth;

    const rowHeight = 18;
    const headerY = y;
    doc.rect(colDesc, headerY, tableWidth, rowHeight).fill('#f0f0f0');
    doc.fillColor('#111').font('Helvetica-Bold').fontSize(9);
    doc.text('Description', colDesc + 6, headerY + 5, { width: colAmt - colDesc - 12 });
    doc.text('Montant', colAmt, headerY + 5, { width: 80, align: 'right' });
    y = headerY + rowHeight;

    doc.font('Helvetica').fontSize(9);
    for (const row of estimate.lines) {
      if (y > doc.page.height - 120) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      const startY = y;
      doc.fillColor('#111');
      doc.text(row.description, colDesc + 6, y, { width: colAmt - colDesc - 12 });
      const descBottom = doc.y;
      doc.text(row.detail, colDesc + 6, descBottom + 2, { width: colAmt - colDesc - 12 });
      const detailBottom = doc.y;
      const amtText = row.amount != null ? formatMoneyFr(row.amount) : 'Sur devis';
      doc.text(amtText, colAmt, startY + 2, { width: pageWidth - (colAmt - colDesc) - 6, align: 'right' });
      y = Math.max(detailBottom, startY + rowHeight) + 6;
      doc.moveTo(colDesc, y - 2).lineTo(colDesc + tableWidth, y - 2).stroke('#eeeeee');
    }

    y += 6;
    if (estimate.subtotal != null) {
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('Sous-total (estimation)', colDesc + 6, y, { width: colAmt - colDesc - 12 });
      doc.text(formatMoneyFr(estimate.subtotal), colAmt, y, {
        width: pageWidth - (colAmt - colDesc) - 6,
        align: 'right',
      });
      y = doc.y + 10;
    }

    doc.font('Helvetica').fontSize(9).fillColor('#444444');
    for (const n of estimate.notes) {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      doc.text(`• ${n}`, colDesc, y, { width: tableWidth });
      y = doc.y + 4;
    }

    y += 10;
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    doc.fontSize(9).fillColor('#555555');
    doc.text(
      'Ce document est une estimation indicative basée sur les informations fournies. Le prix final peut varier après visite et évaluation sur place. Aucun engagement contractuel.',
      colDesc,
      y,
      { width: tableWidth, align: 'left' },
    );

    doc.end();
  });
}
