import Decimal from 'decimal.js';

/** Canon: DECIMALS = 9, 1 ARO = 10^9 arx (CANON §XII / aroscoin pack). */
export const ARO_DECIMALS = 9;
export const ARX_PER_ARO = new Decimal(10).pow(ARO_DECIMALS);

type DecimalInstance = InstanceType<typeof Decimal>;

/**
 * Floor to minimum ARO unit (arx), per emission pack / CANON defaults.
 */
export function floorToArx(amountAro: string | DecimalInstance): DecimalInstance {
  const d = typeof amountAro === 'string' ? new Decimal(amountAro) : amountAro;
  if (d.isNaN() || !d.isFinite()) {
    throw new Error('INVALID_AMOUNT');
  }
  const arx = d.times(ARX_PER_ARO).toDecimalPlaces(0, Decimal.ROUND_DOWN);
  return arx.dividedBy(ARX_PER_ARO);
}

export function parseDecimal(value: string): DecimalInstance {
  try {
    const d = new Decimal(value);
    if (d.isNaN() || !d.isFinite()) {
      throw new Error('INVALID_DECIMAL');
    }
    return d;
  } catch {
    throw new Error('INVALID_DECIMAL');
  }
}

export function minDustAro(): DecimalInstance {
  return new Decimal('0.000000001');
}

export function isAtLeastDust(amountAro: string | DecimalInstance): boolean {
  const d = typeof amountAro === 'string' ? new Decimal(amountAro) : amountAro;
  return d.greaterThanOrEqualTo(minDustAro());
}
