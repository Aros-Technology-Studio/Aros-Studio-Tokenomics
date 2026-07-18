/** Institutional valuation: decimal string, max 9 fraction digits (Core money rules). */
export const AMOUNT_RE = /^-?\d+(\.\d{1,9})?$/;

export function isValidValuation(valuation: unknown): valuation is string {
  return typeof valuation === 'string' && AMOUNT_RE.test(valuation.trim());
}

export const HASH_RE = /^[a-f0-9]{64}$/i;

export function isValidDocumentPackageHash(hash: unknown): hash is string {
  return typeof hash === 'string' && HASH_RE.test(hash.trim());
}
