import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { COMPANY } from '../config/company.js';
import type { QuotePayload } from './quoteSchema.js';
import type { EstimateResult, EstimateLine } from './estimate.js';

const ROOT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOGO_SVG_PATH = path.join(ROOT_DIR, 'public', 'logoNav.svg');
/** Ratio du logo (viewBox 1058 × 251). */
const LOGO_RATIO = 251 / 1058;

/** Palette alignée sur le site (src/index.css). */
const COLOR = {
  ink: '#221E1B',
  muted: '#6B645E',
  brand: '#924F1C',
  border: '#E3DED9',
  surface: '#F7F5F3',
} as const;

const MARGIN = 48;
/** Espace réservé au pied de page, en dehors de la zone où le texte peut couler. */
const FOOTER_H = 38;
const MAX_PHOTOS_IN_PDF = 6;
/** Les montréalais remplissent le formulaire en heure de Montréal ; le serveur tourne en UTC. */
const TIME_ZONE = 'America/Toronto';

// ---------------------------------------------------------------------------
// Mise en forme du texte
// ---------------------------------------------------------------------------

/** Caractères hors Latin-1 encodables par les polices PDF standard (WinAnsi). */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');

/**
 * Les polices standard ne savent pas dessiner l'espace fine (qu'Intl insère
 * dans les montants), ni les emoji ou caractères hors WinAnsi : on les
 * remplace pour éviter les glyphes illisibles.
 */
function pdfText(value: unknown, keepNewlines = false): string {
  let s = String(value ?? '')
    .replace(/[   ]/g, ' ')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ');
  s = keepNewlines ? s.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ');
  return Array.from(s)
    .filter((ch) => {
      const c = ch.codePointAt(0)!;
      return ch === '\n' || (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || WIN_ANSI_EXTRA.has(ch);
    })
    .join('')
    .trim();
}

const money = (n: number) =>
  pdfText(new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n));

const quantity = (n: number) => pdfText(new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 2 }).format(n));

/** « 1 octobre » → « 1er octobre », comme on l'écrit en français. */
const premier = (s: string) => s.replace(/^1 /, '1er ');

function longDate(date: Date): string {
  return premier(pdfText(new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long', timeZone: TIME_ZONE }).format(date)));
}

/** Date saisie au formulaire (AAAA-MM-JJ) : interprétée telle quelle, sans décalage de fuseau. */
function desiredDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return pdfText(iso) || '—';
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
  return premier(pdfText(new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long', timeZone: 'UTC' }).format(d)));
}

function areaLabel(raw: string): string {
  const n = Number(String(raw).replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? `${quantity(n)} pi²` : '—';
}

function servicesLabel(p: QuotePayload): string {
  const parts: string[] = [];
  if (p.services.floor) parts.push('Sablage de plancher');
  if (p.services.stairs) parts.push('Sablage d’escalier');
  if (p.services.repair) parts.push('Réparation de plancher');
  return parts.join(', ') || '—';
}

/** Libellé et précision d'une ligne d'estimation, en langage client. */
function describeLine(line: EstimateLine, p: QuotePayload): { label: string; note: string } {
  if (/^Sablage de plancher/.test(line.description)) {
    const notes = [
      p.floorType === 'prefinished' ? 'Plancher préverni (supplément inclus)' : 'Plancher régulier',
      p.wantColor === 'yes' ? 'avec teinture' : p.wantColor === 'no' ? 'sans teinture' : null,
      'Finitec Ex-Duo+ et/ou Finitec Ex-Tech',
    ].filter(Boolean);
    return { label: 'Sablage et finition de plancher', note: notes.join(' · ') };
  }
  if (line.description.startsWith('Escalier — ')) {
    return { label: `Escalier — ${line.description.slice('Escalier — '.length).toLowerCase()}`, note: '' };
  }
  // Lignes sans montant (réparation, escalier sans quantités…) : le détail explique pourquoi.
  return { label: line.description, note: line.detail };
}

// ---------------------------------------------------------------------------
// Ressources
// ---------------------------------------------------------------------------

async function loadLogoPng(): Promise<Buffer | null> {
  try {
    if (!fs.existsSync(LOGO_SVG_PATH)) return null;
    // Rendu 2× pour rester net à l'impression.
    return await sharp(LOGO_SVG_PATH).resize({ width: 680 }).png().toBuffer();
  } catch (e) {
    console.warn('[pdf] logo indisponible :', e);
    return null;
  }
}

/**
 * Miniatures des photos du client. Ce sont des fichiers non fiables : on
 * plafonne la taille décodée et on ignore silencieusement ce qui ne se lit pas
 * (HEIC notamment, que les binaires de sharp ne décodent pas).
 */
async function loadPhotoThumbs(photoPaths: string[]): Promise<Buffer[]> {
  const thumbs: Buffer[] = [];
  for (const file of photoPaths.slice(0, MAX_PHOTOS_IN_PDF)) {
    try {
      thumbs.push(
        await sharp(file, { limitInputPixels: 60_000_000 })
          .rotate()
          .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 72, mozjpeg: true })
          .toBuffer(),
      );
    } catch {
      /* photo illisible : ignorée */
    }
  }
  return thumbs;
}

// ---------------------------------------------------------------------------
// Génération
// ---------------------------------------------------------------------------

export async function generateQuotePdf(params: {
  submissionId: string;
  createdAt: Date;
  payload: QuotePayload;
  estimate: EstimateResult;
  /** Chemins locaux des photos téléversées (facultatif). */
  photoPaths?: string[];
}): Promise<Buffer> {
  const { submissionId, createdAt, payload: p, estimate } = params;
  const photoPaths = params.photoPaths ?? [];
  const [logo, thumbs] = await Promise.all([loadLogoPng(), loadPhotoThumbs(photoPaths)]);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      margins: { top: MARGIN, left: MARGIN, right: MARGIN, bottom: MARGIN + FOOTER_H },
      info: {
        Title: `Soumission ${submissionId}`,
        Author: 'TALON PLANCHER',
        Subject: `Estimation — ${servicesLabel(p)}`,
        Creator: 'talonplancher.com',
      },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const left = MARGIN;
    const width = doc.page.width - MARGIN * 2;
    const right = left + width;
    const pageBottom = () => doc.page.height - doc.page.margins.bottom;

    const font = (bold: boolean, size: number, color: string = COLOR.ink) =>
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size).fillColor(color);

    const hRule = (y: number, color: string = COLOR.border, weight = 0.75) =>
      doc.moveTo(left, y).lineTo(right, y).lineWidth(weight).strokeColor(color).stroke();

    /** Petit titre de section en capitales espacées, suivi d'un filet. */
    const sectionLabel = (text: string, y: number): number => {
      font(true, 7.5, COLOR.brand).text(text.toUpperCase(), left, y, { width, characterSpacing: 1.1 });
      hRule(y + 13);
      return y + 22;
    };

    /** Saute à une nouvelle page si la hauteur demandée ne tient plus. */
    const ensureSpace = (y: number, needed: number): number => {
      if (y + needed <= pageBottom()) return y;
      doc.addPage();
      return doc.page.margins.top;
    };

    // ---------------- En-tête ----------------
    let y = MARGIN;
    const logoW = 176;
    if (logo) {
      doc.image(logo, left, y + 2, { width: logoW, height: logoW * LOGO_RATIO });
    } else {
      font(true, 16).text('TALON PLANCHER', left, y + 8);
    }

    const metaW = 230;
    font(true, 7.5, COLOR.brand).text('SOUMISSION', right - metaW, y, {
      width: metaW,
      align: 'right',
      characterSpacing: 1.1,
    });
    font(true, 16).text(`N° ${submissionId}`, right - metaW, y + 12, { width: metaW, align: 'right' });
    font(false, 9, COLOR.muted).text(`Émise le ${longDate(createdAt)}`, right - metaW, y + 33, {
      width: metaW,
      align: 'right',
    });

    y += 54;
    hRule(y, COLOR.brand, 1.5);
    y += 18;

    // ---------------- Client / Entreprise ----------------
    const gap = 28;
    const colW = (width - gap) / 2;
    const party = (x: number, title: string, name: string, lines: string[]): number => {
      font(true, 7.5, COLOR.muted).text(title, x, y, { width: colW, characterSpacing: 1.1 });
      font(true, 11).text(pdfText(name), x, y + 13, { width: colW });
      let yy = doc.y + 3;
      for (const line of lines.filter(Boolean)) {
        font(false, 9.5).text(pdfText(line), x, yy, { width: colW, lineGap: 1 });
        yy = doc.y + 1.5;
      }
      return yy;
    };
    const clientBottom = party(left, 'CLIENT', `${p.firstName} ${p.lastName}`, [
      p.address,
      `${p.city} ${p.postalCode.toUpperCase()}`,
      p.phone,
      p.email,
    ]);
    const companyBottom = party(left + colW + gap, 'ENTREPRISE', 'TALON PLANCHER', [
      COMPANY.cityLine,
      COMPANY.phone,
      COMPANY.email,
      'talonplancher.com',
    ]);
    y = Math.max(clientBottom, companyBottom) + 16;

    // ---------------- Projet ----------------
    y = sectionLabel('Projet', y);
    const facts: [string, string][] = [
      ['Services demandés', servicesLabel(p)],
      ['Date souhaitée', desiredDate(p.date)],
    ];
    if (p.services.floor) {
      facts.push(
        ['Type de plancher', p.floorType === 'prefinished' ? 'Préverni' : 'Régulier'],
        // Même lecture que buildEstimate, sinon « 1 200,5 » s'afficherait 0 ici mais serait facturé 1 200,5.
        ['Superficie', areaLabel(p.area)],
        ['Teinture', p.wantColor === 'yes' ? 'Oui' : p.wantColor === 'no' ? 'Non' : 'Non précisé'],
      );
    }
    facts.push(['Photos jointes', String(photoPaths.length)]);

    // Trois colonnes : le bloc reste compact pour que le devis tienne sur une page.
    const factGap = 18;
    const factW = (width - factGap * 2) / 3;
    for (let i = 0; i < facts.length; i += 3) {
      let rowBottom = y;
      facts.slice(i, i + 3).forEach(([label, value], j) => {
        const x = left + j * (factW + factGap);
        font(false, 8, COLOR.muted).text(label, x, y, { width: factW });
        font(false, 10).text(pdfText(value), x, y + 11, { width: factW });
        rowBottom = Math.max(rowBottom, doc.y);
      });
      y = rowBottom + 8;
    }
    y += 6;

    // ---------------- Estimation ----------------
    y = ensureSpace(y, 120);
    y = sectionLabel('Estimation', y);

    const colQty = 64;
    const colUnit = 86;
    const colAmount = 92;
    const colDesc = width - colQty - colUnit - colAmount;
    const xQty = left + colDesc;
    const xUnit = xQty + colQty;
    const xAmount = xUnit + colUnit;
    const pad = 8;

    const tableHeader = (yy: number): number => {
      doc.rect(left, yy, width, 22).fill(COLOR.surface);
      font(true, 8, COLOR.muted);
      doc.text('DESCRIPTION', left + pad, yy + 7, { width: colDesc - pad * 2, characterSpacing: 0.6 });
      doc.text('QTÉ', xQty, yy + 7, { width: colQty - pad, align: 'right', characterSpacing: 0.6 });
      doc.text('PRIX UNIT.', xUnit, yy + 7, { width: colUnit - pad, align: 'right', characterSpacing: 0.6 });
      doc.text('MONTANT', xAmount, yy + 7, { width: colAmount - pad, align: 'right', characterSpacing: 0.6 });
      return yy + 22;
    };

    y = tableHeader(y);
    for (const line of estimate.lines) {
      const { label, note } = describeLine(line, p);
      font(true, 10);
      const labelH = doc.heightOfString(pdfText(label), { width: colDesc - pad * 2 });
      font(false, 8.5);
      const noteH = note ? doc.heightOfString(pdfText(note), { width: colDesc - pad * 2 }) + 2 : 0;
      const rowH = Math.max(labelH + noteH, 12) + 12;

      if (y + rowH > pageBottom()) {
        doc.addPage();
        y = tableHeader(doc.page.margins.top);
      }

      font(true, 10).text(pdfText(label), left + pad, y + 6, { width: colDesc - pad * 2 });
      if (note) font(false, 8.5, COLOR.muted).text(pdfText(note), left + pad, doc.y + 2, { width: colDesc - pad * 2 });

      const hasPrice = line.amount != null && line.quantity != null && line.unitPrice != null;
      font(false, 10);
      if (hasPrice) {
        const unit = line.unit === 'unité' && line.quantity! > 1 ? 'unités' : pdfText(line.unit ?? '');
        doc.text(`${quantity(line.quantity!)} ${unit}`, xQty, y + 6, { width: colQty - pad, align: 'right' });
        doc.text(money(line.unitPrice!), xUnit, y + 6, { width: colUnit - pad, align: 'right' });
      }
      if (line.amount != null) {
        font(true, 10).text(money(line.amount), xAmount, y + 6, { width: colAmount - pad, align: 'right' });
      } else {
        font(false, 9, COLOR.muted).text('Sur évaluation', xAmount, y + 6, { width: colAmount - pad, align: 'right' });
      }

      y += rowH;
      hRule(y);
    }

    // Sous-total
    y = ensureSpace(y, 60);
    hRule(y, COLOR.ink, 1);
    y += 10;
    font(true, 10).text('Sous-total', xUnit - 60, y + 2, { width: colUnit + 60 - pad, align: 'right' });
    if (estimate.subtotal != null) {
      font(true, 13, COLOR.brand).text(money(estimate.subtotal), xAmount - 20, y, {
        width: colAmount + 20 - pad,
        align: 'right',
      });
    } else {
      font(false, 10, COLOR.muted).text('Sur évaluation', xAmount - 20, y + 2, { width: colAmount + 20 - pad, align: 'right' });
    }
    y += 24;

    const tableNotes = ['Montants avant taxes applicables.'];
    if (estimate.lines.some((l) => l.amount == null)) {
      tableNotes.push('Les éléments « Sur évaluation » ne sont pas inclus dans le sous-total.');
    }
    tableNotes.push('Estimation préliminaire calculée à partir des informations fournies par le client.');
    font(false, 8, COLOR.muted).text(tableNotes.join(' '), left, y, { width, lineGap: 1.5 });
    y = doc.y + 18;

    // ---------------- Textes libres (complets, sur plusieurs pages si besoin) ----------------
    const freeText = (title: string, body: string) => {
      const text = pdfText(body, true);
      if (!text) return;
      // Réserve le titre + jusqu'à trois lignes : un texte court reste sur la page,
      // un texte long commence ici et se poursuit sur la suivante.
      font(false, 9.5);
      const textH = doc.heightOfString(text, { width, lineGap: 2.5 });
      y = ensureSpace(y, 22 + Math.min(textH, 40));
      y = sectionLabel(title, y);
      font(false, 9.5).text(text, left, y, { width, lineGap: 2.5 });
      y = doc.y + 16;
    };
    freeText('Description du projet', p.details);
    freeText('Besoins particuliers', p.specialNeeds);

    // ---------------- Photos ----------------
    if (thumbs.length) {
      doc.addPage();
      y = sectionLabel('Photos fournies par le client', doc.page.margins.top);
      const cellGap = 14;
      const cellW = (width - cellGap) / 2;
      const cellH = 190;
      thumbs.forEach((img, i) => {
        const x = left + (i % 2) * (cellW + cellGap);
        const yy = y + Math.floor(i / 2) * (cellH + cellGap);
        doc.rect(x, yy, cellW, cellH).fill(COLOR.surface);
        doc.image(img, x + 4, yy + 4, { fit: [cellW - 8, cellH - 8], align: 'center', valign: 'center' });
      });
      const extra = photoPaths.length - thumbs.length;
      if (extra > 0) {
        const lastRow = Math.ceil(thumbs.length / 2);
        font(false, 8.5, COLOR.muted).text(
          `${extra} autre(s) photo(s) non reproduite(s) ici ; tous les fichiers sont joints au courriel et disponibles dans l’historique.`,
          left,
          y + lastRow * (cellH + cellGap),
          { width },
        );
      }
    }

    // ---------------- Pied de page sur chaque page ----------------
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      // Écrire dans la marge basse sans déclencher de saut de page automatique.
      const savedBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      const fy = doc.page.height - MARGIN - 26;
      hRule(fy);
      font(false, 7.5, COLOR.muted).text(
        `TALON PLANCHER · ${COMPANY.phone} · ${COMPANY.email} · talonplancher.com`,
        left,
        fy + 8,
        { width: width - 70 },
      );
      font(false, 7.5, COLOR.muted).text(`Page ${i - range.start + 1} / ${range.count}`, right - 70, fy + 8, {
        width: 70,
        align: 'right',
      });
      if (COMPANY.pdfCertificationLines.length) {
        font(false, 7, COLOR.muted).text(pdfText(COMPANY.pdfCertificationLines.join(' ')), left, fy + 19, { width });
      }
      doc.page.margins.bottom = savedBottom;
    }

    doc.end();
  });
}
