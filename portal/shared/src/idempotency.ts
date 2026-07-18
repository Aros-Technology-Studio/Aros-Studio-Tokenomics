import { createHash } from 'crypto';

export const IDEMPOTENCY_KEY_MIN = 8;
export const IDEMPOTENCY_KEY_MAX = 128;

export function isValidIdempotencyKey(key: string | undefined | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const t = key.trim();
  return t.length >= IDEMPOTENCY_KEY_MIN && t.length <= IDEMPOTENCY_KEY_MAX;
}

/** Stable fingerprint of request body for idempotency payload match. */
export function payloadFingerprint(body: unknown): string {
  const canonical = JSON.stringify(sortKeys(body));
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  const o = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) {
    if (o[k] === undefined) continue;
    out[k] = sortKeys(o[k]);
  }
  return out;
}

export interface IdempotencyRecord {
  key: string;
  institutionId: string;
  fingerprint: string;
  processId: string;
  createdAt: string;
}
