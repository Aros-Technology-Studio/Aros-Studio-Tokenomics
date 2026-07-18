/**
 * Bit-stable canonical JSON for AST encodings.
 * - object keys sorted lexicographically at every level
 * - arrays preserve order (elements canonicalized)
 * - no whitespace
 * - only JSON-safe types (string, number, boolean, null, object, array)
 * - amounts must already be decimal strings (validated upstream)
 */

export function canonicalEncode(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function canonicalize(value: unknown): unknown {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'boolean') return value;
  if (t === 'number') {
    if (!Number.isFinite(value as number)) {
      throw new Error('non-finite number forbidden in canonical encoding');
    }
    // Integers only for non-amount metadata; amounts are strings
    if (!Number.isInteger(value as number)) {
      throw new Error('non-integer number forbidden — use decimal strings for amounts');
    }
    return value;
  }
  if (t === 'bigint') {
    throw new Error('bigint forbidden — use decimal strings');
  }
  if (t !== 'object') {
    throw new Error(`unsupported type: ${t}`);
  }
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  const o = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) {
    const v = o[k];
    if (v === undefined) continue; // drop undefined
    out[k] = canonicalize(v);
  }
  return out;
}
