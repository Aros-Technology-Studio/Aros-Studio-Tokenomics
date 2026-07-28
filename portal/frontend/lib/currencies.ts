/**
 * Institutional valuation currencies (as stated on the document).
 * ARO is the network unit of account after institutional declaration.
 */

export const VALUATION_CURRENCIES = [
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'GEL', label: 'Georgian Lari (GEL)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'ARO', label: 'ARO (already network units)' },
  { code: 'OTHER', label: 'Other (see note)' },
] as const;

export type ValuationCurrencyCode = (typeof VALUATION_CURRENCIES)[number]['code'];

/**
 * v1 policy (Canon): AST does not set FX market rates.
 * Institution declares amount + currency from the document.
 * ARO mint figure = amount × institutionalAroPerUnit (default 1 = one-to-one mapping of the number).
 */
export function computeAroMintAmount(
  amountFromDocument: string,
  institutionalAroPerUnit: string = '1',
): string {
  const amt = parseDecimal(amountFromDocument);
  const rate = parseDecimal(institutionalAroPerUnit || '1');
  if (amt === null || rate === null) return '';
  // 9 decimal fixed-point via integer math
  const scale = 1_000_000_000n;
  const a = toScaled(amt, scale);
  const r = toScaled(rate, scale);
  const product = (a * r) / scale;
  return formatScaled(product, scale);
}

function parseDecimal(s: string): string | null {
  const t = s.trim().replace(/,/g, '');
  if (!/^-?\d+(\.\d{1,18})?$/.test(t)) return null;
  return t;
}

function toScaled(dec: string, scale: bigint): bigint {
  const neg = dec.startsWith('-');
  const t = neg ? dec.slice(1) : dec;
  const [w, f = ''] = t.split('.');
  const frac = (f + '000000000').slice(0, 9);
  const v = BigInt(w) * scale + BigInt(frac);
  return neg ? -v : v;
}

function formatScaled(v: bigint, scale: bigint): string {
  const neg = v < 0n;
  const x = neg ? -v : v;
  const w = x / scale;
  const f = (x % scale).toString().padStart(9, '0');
  return `${neg ? '-' : ''}${w}.${f}`;
}
