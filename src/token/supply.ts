import { parseAro, formatAro } from '../common/money';

/**
 * Canon §6.4 / §9.10:
 * increase: new_supply = current × (1 + ΔV / previous)
 * decrease: new_supply = current × (1 − ΔV / previous)
 * Δ distributed pro-rata to current holders.
 */
export function computeRevaluationSupply(
  currentSupply: string,
  previousValue: string,
  newValue: string,
): { supplyAfter: string; deltaSupply: string; direction: 'mint' | 'burn' | 'none' } {
  const cur = parseAro(currentSupply);
  const prev = parseAro(previousValue);
  const next = parseAro(newValue);
  if (prev <= 0n) {
    throw new Error('previousValue must be positive');
  }
  if (cur < 0n) {
    throw new Error('currentSupply invalid');
  }
  if (next === prev || cur === 0n) {
    return { supplyAfter: formatAro(cur), deltaSupply: formatAro(0n), direction: 'none' };
  }

  // new = cur * next / prev  (integer arx)
  const supplyAfter = (cur * next) / prev;
  const delta = supplyAfter - cur;
  if (delta > 0n) {
    return {
      supplyAfter: formatAro(supplyAfter),
      deltaSupply: formatAro(delta),
      direction: 'mint',
    };
  }
  if (delta < 0n) {
    return {
      supplyAfter: formatAro(supplyAfter),
      deltaSupply: formatAro(-delta),
      direction: 'burn',
    };
  }
  return { supplyAfter: formatAro(cur), deltaSupply: formatAro(0n), direction: 'none' };
}

/** Pro-rata share of delta across balances; last holder gets residual. */
export function proRataAllocate(
  balances: Map<string, bigint>,
  deltaArx: bigint,
): Array<{ holderId: string; delta: bigint }> {
  if (deltaArx === 0n) return [];
  const entries = [...balances.entries()].filter(([, b]) => b > 0n);
  const total = entries.reduce((s, [, b]) => s + b, 0n);
  if (total <= 0n) return [];

  const out: Array<{ holderId: string; delta: bigint }> = [];
  let allocated = 0n;
  entries.forEach(([holderId, bal], i) => {
    let share: bigint;
    if (i === entries.length - 1) {
      share = deltaArx - allocated;
    } else {
      share = (deltaArx * bal) / total;
      allocated += share;
    }
    if (share !== 0n) out.push({ holderId, delta: share });
  });
  return out;
}
