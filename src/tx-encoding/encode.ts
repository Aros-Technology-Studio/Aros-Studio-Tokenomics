import { createHash } from 'crypto';

/** Deterministic process payload encoding (layer 02). */

export function canonicalEncode(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  const o = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) out[k] = sortKeys(o[k]);
  return out;
}

export function payloadHash(value: unknown): string {
  return createHash('sha256').update(canonicalEncode(value)).digest('hex');
}

export interface EncodedProcessTx {
  schemaVersion: string;
  processId: string;
  processType: string;
  encoded: string;
  payloadHash: string;
}

export function encodeProcessTx(input: {
  processId: string;
  processType: string;
  body: Record<string, unknown>;
}): EncodedProcessTx {
  const wrapper = {
    schemaVersion: 'ast-tx-1',
    processId: input.processId,
    processType: input.processType,
    body: input.body,
  };
  const encoded = canonicalEncode(wrapper);
  return {
    schemaVersion: 'ast-tx-1',
    processId: input.processId,
    processType: input.processType,
    encoded,
    payloadHash: createHash('sha256').update(encoded).digest('hex'),
  };
}
