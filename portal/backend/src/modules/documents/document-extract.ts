/**
 * Lightweight PDF / text / optional OCR assist for institutional packages.
 * Helps operators copy figures that already appear in the file.
 * AST does not appraise — human confirms.
 */
import { detectImageKind, runOcrOnImage } from './ocr';

export type ExtractMode =
  | 'pdf_rough'
  | 'plain_text'
  | 'empty'
  | 'image_ocr'
  | 'image_no_ocr'
  | 'scan_suspect';

export interface ExtractHints {
  suggestedValuation: string | null;
  suggestedHolderId: string | null;
  suggestedAssetId: string | null;
  amountsFound: string[];
  identifiersFound: string[];
  textPreview: string;
  textLength: number;
  mode: ExtractMode;
  notes: string[];
  ocrEngine?: string | null;
}

/** Pull long-ish printable runs from binary (works on many text PDFs). */
export function roughExtractText(buf: Buffer): string {
  const chunks: string[] = [];
  let cur = '';
  for (let i = 0; i < buf.length; i += 1) {
    const c = buf[i];
    const printable =
      (c >= 0x20 && c <= 0x7e) ||
      c === 0x09 ||
      c === 0x0a ||
      c === 0x0d ||
      // basic UTF-8 continuation allowed after high start — keep simple latin + digits
      (c >= 0xc0 && c <= 0xf4);
    if (printable && c < 0x80) {
      cur += String.fromCharCode(c);
    } else if (cur.length >= 4) {
      chunks.push(cur);
      cur = '';
    } else {
      cur = '';
    }
  }
  if (cur.length >= 4) chunks.push(cur);
  // Prefer PDF string literals (…)
  const joined = chunks.join('\n');
  const paren = [...joined.matchAll(/\(([^)]{3,200})\)/g)].map((m) => m[1]);
  if (paren.length > 5) {
    return paren.join('\n');
  }
  return joined;
}

function normalizeAmount(raw: string): string | null {
  const t = raw.replace(/\s/g, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,9})?$/.test(t)) return null;
  // reject tiny noise like page numbers if no decimal and < 1000? keep all for list
  const [w, f = ''] = t.split('.');
  const frac = (f + '000000000').slice(0, 9);
  return `${w}.${frac}`;
}

export function analyzeDocumentText(
  text: string,
  baseMode: ExtractMode = 'pdf_rough',
): ExtractHints {
  const notes: string[] = [];
  const amountsFound: string[] = [];
  const identifiersFound: string[] = [];

  if (!text.trim()) {
    return {
      suggestedValuation: null,
      suggestedHolderId: null,
      suggestedAssetId: null,
      amountsFound: [],
      identifiersFound: [],
      textPreview: '',
      textLength: 0,
      mode: baseMode === 'pdf_rough' ? 'empty' : baseMode,
      notes: [
        'No extractable text (likely a scanned image PDF). Enter fields from the document manually after e-sign confirm.',
      ],
      ocrEngine: null,
    };
  }

  // Decimal money-like: 1 250 000.50 or 1250000.50 or 1,250,000.50
  const amountRe =
    /\b(\d{1,3}(?:[ ,]\d{3})+(?:\.\d{1,9})?|\d{4,12}(?:\.\d{1,9})?|\d+\.\d{2,9})\b/g;
  let m: RegExpExecArray | null;
  while ((m = amountRe.exec(text)) !== null) {
    const n = normalizeAmount(m[1]);
    if (n && !amountsFound.includes(n)) amountsFound.push(n);
  }

  // Prefer larger amounts as valuation candidates
  const sorted = [...amountsFound].sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    return nb - na;
  });
  const suggestedValuation = sorted.find((a) => Number(a) >= 100) ?? sorted[0] ?? null;
  if (suggestedValuation) {
    notes.push('Suggested valuation is the largest amount-like figure found in the package text.');
  }

  // Holder-like labels
  const holderLabel =
    text.match(
      /(?:holder|owner|собственник|владелец|owner\s*id|holder\s*id)\s*[:#]?\s*([A-Za-z0-9._@-]{3,64})/i,
    )?.[1] ?? null;
  if (holderLabel) notes.push('Found a holder/owner label near an identifier.');

  // Asset / cadastral-ish
  const assetMatch =
    text.match(
      /(?:cadastr\w*|cadastre|asset\s*id|property\s*id|кадастр\w*|реестр(?:овый)?\s*номер)\s*[:#]?\s*([A-Za-z0-9./:-]{3,64})/i,
    )?.[1] ?? null;

  // Generic long alphanumerics
  const idRe = /\b([A-Z]{2,}[A-Z0-9-]{4,}|[0-9]{2}:[0-9]{2}:[0-9]{6,})\b/g;
  while ((m = idRe.exec(text)) !== null) {
    if (!identifiersFound.includes(m[1]) && identifiersFound.length < 12) {
      identifiersFound.push(m[1]);
    }
  }

  const preview = text.replace(/\s+/g, ' ').trim().slice(0, 800);

  return {
    suggestedValuation,
    suggestedHolderId: holderLabel,
    suggestedAssetId: assetMatch,
    amountsFound: sorted.slice(0, 12),
    identifiersFound,
    textPreview: preview,
    textLength: text.length,
    mode: baseMode,
    notes,
    ocrEngine: null,
  };
}

export function extractFromBuffer(
  buf: Buffer,
  fileName?: string,
): ExtractHints {
  const name = (fileName ?? '').toLowerCase();
  const imageKind = detectImageKind(buf, fileName);

  // D5: raster images → optional OCR
  if (imageKind) {
    const ocr = runOcrOnImage(buf, imageKind);
    if (ocr?.text?.trim()) {
      const h = analyzeDocumentText(ocr.text, 'image_ocr');
      return {
        ...h,
        mode: 'image_ocr',
        ocrEngine: ocr.engine,
        notes: [
          ...h.notes,
          `OCR assist via ${ocr.engine}. Confirm every figure against the visual document.`,
        ],
      };
    }
    return {
      suggestedValuation: null,
      suggestedHolderId: null,
      suggestedAssetId: null,
      amountsFound: [],
      identifiersFound: [],
      textPreview: '',
      textLength: 0,
      mode: 'image_no_ocr',
      ocrEngine: null,
      notes: [
        `Image package detected (${imageKind}) but no OCR engine available.`,
        'Install tesseract or set AST_OCR_CMD="{input}" to enable assist.',
        'Enter valuation fields manually from the signed scan after e-sign confirm.',
      ],
    };
  }

  const isPdf = name.endsWith('.pdf') || buf.slice(0, 5).toString('utf8') === '%PDF-';
  if (!isPdf && buf.length < 2_000_000) {
    const text = buf.toString('utf8');
    const h = analyzeDocumentText(text, 'plain_text');
    return { ...h, mode: text.trim() ? 'plain_text' : 'empty' };
  }

  const text = roughExtractText(buf);
  if (!text.trim() || text.replace(/\s+/g, '').length < 40) {
    const h = analyzeDocumentText(text, 'scan_suspect');
    return {
      ...h,
      mode: text.trim() ? 'scan_suspect' : 'empty',
      notes: [
        ...h.notes,
        'PDF has little extractable text — likely a scan. Export page to PNG and re-upload, or enter fields manually. See docs/portal/OCR-D5.md.',
      ],
    };
  }
  return analyzeDocumentText(text, 'pdf_rough');
}
