/**
 * Fixed-scale money helpers for ARO (9 decimals).
 * Amounts are decimal strings — never IEEE floats for value.
 */

export const ARO_SCALE = 9;
export const ARO_DUST = '0.000000001'; // 10⁻⁹ ARO / 1 arx (Core Canon §XII)

const SCALE = BigInt(ARO_SCALE);
const FACTOR = 10n ** SCALE;

export function parseAro(amount: string): bigint {
  const t = amount.trim();
  if (!/^-?\d+(\.\d+)?$/.test(t)) {
    throw new Error(`invalid amount: ${amount}`);
  }
  const neg = t.startsWith('-');
  const s = neg ? t.slice(1) : t;
  const [w, f = ''] = s.split('.');
  if (f.length > ARO_SCALE) throw new Error('too many decimals (max 9)');
  const frac = (f + '000000000').slice(0, ARO_SCALE);
  const v = BigInt(w) * FACTOR + BigInt(frac);
  return neg ? -v : v;
}

export function formatAro(arx: bigint): string {
  const neg = arx < 0n;
  const v = neg ? -arx : arx;
  const w = v / FACTOR;
  const f = (v % FACTOR).toString().padStart(ARO_SCALE, '0');
  return `${neg ? '-' : ''}${w}.${f}`;
}

export function addAro(a: string, b: string): string {
  return formatAro(parseAro(a) + parseAro(b));
}

export function subAro(a: string, b: string): string {
  return formatAro(parseAro(a) - parseAro(b));
}

/** -1 if a<b, 0 if equal, 1 if a>b */
export function cmpAro(a: string, b: string): -1 | 0 | 1 {
  const d = parseAro(a) - parseAro(b);
  if (d < 0n) return -1;
  if (d > 0n) return 1;
  return 0;
}

export function isPositiveAro(amount: string): boolean {
  return parseAro(amount) > 0n;
}

export function isNonNegativeAro(amount: string): boolean {
  return parseAro(amount) >= 0n;
}

/** True if amount is strictly less than dust unit (and non-zero dust floor applies). */
export function isBelowDust(amount: string): boolean {
  const v = parseAro(amount);
  return v > 0n && v < parseAro(ARO_DUST);
}

export function mulRate(amount: string, rate: number): string {
  // rate as float e.g. 0.0015 — scale to 1e9 integer basis
  const arx = parseAro(amount);
  const scaled = BigInt(Math.round(rate * 1_000_000_000));
  return formatAro((arx * scaled) / 1_000_000_000n);
}

export function split70_30(total: string): { nodes: string; ast: string } {
  const arx = parseAro(total);
  const nodes = (arx * 70n) / 100n;
  const ast = arx - nodes;
  return { nodes: formatAro(nodes), ast: formatAro(ast) };
}
