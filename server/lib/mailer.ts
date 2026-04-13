import { Resend } from 'resend';
import fs from 'node:fs';
import path from 'node:path';

/** Levée quand l’envoi réel est demandé mais Resend n’est pas configuré. */
export class MailConfigError extends Error {
  constructor() {
    super(
      'Configuration Resend incomplète. Ajoutez RESEND_API_KEY dans .env, ou utilisez SKIP_EMAIL=true pour tester sans envoyer de courriels.',
    );
    this.name = 'MailConfigError';
  }
}

function resendApiKeyPresent(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Si true : pas d’envoi (fichiers restent générés / stockés). */
export function isSkipEmailMode(): boolean {
  const v = process.env.SKIP_EMAIL?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new MailConfigError();
  }
  return new Resend(key);
}

const INTERNAL_ATTACH_MAX_TOTAL_BYTES = 12 * 1024 * 1024;

function resendErrorMessage(err: { message: string; name?: string }): string {
  const name = err.name ? `[resend:${err.name}] ` : '';
  return `${name}${err.message}`;
}

export async function sendQuoteEmails(params: {
  clientEmail: string;
  internalEmail: string;
  fromAddress: string;
  submissionId: string;
  excelBuffer: Buffer;
  photoPaths: string[];
  clientName: string;
}): Promise<void> {
  const { clientEmail, internalEmail, fromAddress, submissionId, excelBuffer, photoPaths, clientName } =
    params;

  if (isSkipEmailMode()) {
    console.warn('[mail] SKIP_EMAIL activé — aucun courriel envoyé.');
    console.warn(
      `[mail] Soumission ${submissionId} | client: ${clientEmail} | interne: ${internalEmail} | Excel: ${excelBuffer.length} o | photos: ${photoPaths.length}`,
    );
    return;
  }

  if (!resendApiKeyPresent()) {
    throw new MailConfigError();
  }

  const resend = getResend();
  const excelName = `Soumission-${submissionId}.xlsx`;
  const excelBase64 = excelBuffer.toString('base64');

  const photoLines = photoPaths.map((p) => `- ${path.basename(p)} (${p})`);
  const publicBase = process.env.PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  const internalText = [
    `Nouvelle soumission ${submissionId}`,
    `Client : ${clientName} <${clientEmail}>`,
    '',
    'Fichiers téléversés :',
    photoPaths.length ? photoLines.join('\n') : '(aucune photo)',
    '',
    publicBase
      ? 'Les fichiers sont stockés sur le serveur ; configurez un endpoint de téléchargement sécurisé si besoin.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  let total = 0;
  const imageAttachments: { filename: string; content: string }[] = [];
  for (const filePath of photoPaths) {
    if (!fs.existsSync(filePath)) continue;
    const st = fs.statSync(filePath);
    if (total + st.size > INTERNAL_ATTACH_MAX_TOTAL_BYTES) break;
    total += st.size;
    const buf = await fs.promises.readFile(filePath);
    imageAttachments.push({ filename: path.basename(filePath), content: buf.toString('base64') });
  }

  const internalResult = await resend.emails.send({
    from: fromAddress,
    to: internalEmail,
    replyTo: internalEmail,
    subject: `[Soumission] ${submissionId} — ${clientName}`,
    text: internalText,
    attachments: [{ filename: excelName, content: excelBase64 }, ...imageAttachments],
  });
  if (internalResult.error) {
    throw new Error(resendErrorMessage(internalResult.error));
  }
}
