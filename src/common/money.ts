/** Fixed-scale money helpers for ARO (9 decimals). Amounts as decimal strings. */

const SCALE = 9n;
const FACTOR = 10n ** SCALE;

export function parseAro(amount: string): bigint {
  const t = amount.trim();
  if (!/^-?\d+(\.\d+)?$/.test(t)) {
    throw new Error(`invalid amount: ${amount}`);
  }
  const neg = t.startsWith('-');
  const s = neg ? t.slice(1) : t;
  const [w, f = ''] = s.split('.');
  if (f.length > 9) throw new Error('too many decimals');
  const frac = (f + '000000000').slice(0, 9);
  const v = BigInt(w) * FACTOR + BigInt(frac);
  return neg ? -v : v;
}

export function formatAro(arx: bigint): string {
  const neg = arx < 0n;
  const v = neg ? -arx : arx;
  const w = v / FACTOR;
  const f = (v % FACTOR).toString().padStart(9, '0');
  return `${neg ? '-' : ''}${w}.${f}`;
}

export function mulRate(amount: string, rate: number): string {
  // rate as float e.g. 0.0015 — use integer basis points * 1e6 for safety
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
