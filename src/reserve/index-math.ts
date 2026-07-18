/**
 * Canon §9.2: reserveIndex = log10(1 + totalProcessVolume)
 * volume in whole ARO (not arx) for soft growth scale.
 */
export function computeReserveIndex(totalProcessVolumeArx: bigint): number {
  const volAro = Number(totalProcessVolumeArx) / 1e9;
  if (!Number.isFinite(volAro) || volAro < 0) return 0;
  return Math.log10(1 + volAro);
}

/**
 * Canon §9.3 informational only — NOT used for minting.
 */
export function internalPriceHint(base: number, reserveIndex: number): number {
  return base * reserveIndex;
}
