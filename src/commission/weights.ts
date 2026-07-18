import { formatAro } from '../common/money';

/**
 * Integer pro-rata of pool by relative weights; last node gets residual.
 */
export function distributeByWeight(
  poolArx: bigint,
  nodeWeights: Record<string, number>,
): Record<string, string> {
  const entries = Object.entries(nodeWeights).filter(([, w]) => w > 0);
  if (!entries.length || poolArx <= 0n) {
    return {};
  }
  // Use milli-weights to avoid float
  const milli = entries.map(([id, w]) => [id, Math.round(w * 1000)] as const);
  const totalMilli = milli.reduce((s, [, m]) => s + m, 0);
  if (totalMilli <= 0) {
    throw new Error('weights sum to zero');
  }

  const payments: Record<string, string> = {};
  let allocated = 0n;
  milli.forEach(([nodeId, m], i) => {
    let share: bigint;
    if (i === milli.length - 1) {
      share = poolArx - allocated;
    } else {
      share = (poolArx * BigInt(m)) / BigInt(totalMilli);
      allocated += share;
    }
    payments[nodeId] = formatAro(share);
  });
  return payments;
}
