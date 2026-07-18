import { canonicalEncode } from './canonical';
import { EncodingError, EncodingErrorCode } from './errors';
import { sha256HexUtf8 } from './hash';
import { validateAndNormalize } from './schema';
import {
  TX_CONTENT_TYPE,
  TX_SCHEMA_VERSION,
  type DecodeResult,
  type EncodedProcessTx,
  type ProcessTxInput,
} from './types';

// Re-exports for callers that imported from encode.ts
export { canonicalEncode } from './canonical';
export { payloadHash } from './hash';
export type { EncodedProcessTx, ProcessTxInput, DecodeResult } from './types';
export { getSchema, listSchemas, validateAndNormalize } from './schema';
export { EncodingError, EncodingErrorCode } from './errors';
export { TX_SCHEMA_VERSION, TX_CONTENT_TYPE } from './types';

/**
 * Canonical envelope fields in fixed semantic order for hashing identity.
 * Keys are sorted by canonicalEncode anyway.
 */
function envelope(input: {
  processId: string;
  processType: string;
  body: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    body: input.body,
    processId: input.processId,
    processType: input.processType,
    schemaVersion: TX_SCHEMA_VERSION,
  };
}

/**
 * Encode a process transaction to a single deterministic package.
 * Pure validation + serialization — no mint, no PoT, no NodeChain write.
 */
export function encodeProcessTx(input: ProcessTxInput): EncodedProcessTx {
  const body = validateAndNormalize(input);
  const env = envelope({
    processId: input.processId,
    processType: input.processType,
    body,
  });
  const encoded = canonicalEncode(env);
  const hash = sha256HexUtf8(encoded);
  return {
    schemaVersion: TX_SCHEMA_VERSION,
    contentType: TX_CONTENT_TYPE,
    processId: input.processId,
    processType: input.processType,
    encoded,
    payloadHash: hash,
    body,
  };
}

/**
 * Decode and re-validate. Checks hash integrity if expectedHash provided.
 */
export function decodeProcessTx(
  encoded: string,
  expectedHash?: string,
): DecodeResult {
  const reasonCodes: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(encoded);
  } catch {
    return {
      processId: '',
      processType: '',
      schemaVersion: '',
      body: { institutionId: '' },
      payloadHash: '',
      valid: false,
      reasonCodes: [EncodingErrorCode.DECODE_FAILED],
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      processId: '',
      processType: '',
      schemaVersion: '',
      body: { institutionId: '' },
      payloadHash: '',
      valid: false,
      reasonCodes: [EncodingErrorCode.DECODE_FAILED],
    };
  }

  const o = parsed as Record<string, unknown>;
  const processId = String(o.processId ?? '');
  const processType = String(o.processType ?? '');
  const schemaVersion = String(o.schemaVersion ?? '');
  const bodyRaw = o.body;

  const recomputed = sha256HexUtf8(canonicalEncode(parsed));
  if (expectedHash && expectedHash !== recomputed) {
    reasonCodes.push(EncodingErrorCode.HASH_MISMATCH);
  }

  try {
    const normalized = validateAndNormalize({
      processId,
      processType,
      body: (bodyRaw ?? {}) as ProcessTxInput['body'],
    });
    // re-encode must match identity for valid packages at current schema
    const again = encodeProcessTx({ processId, processType, body: normalized });
    if (again.payloadHash !== recomputed && schemaVersion === TX_SCHEMA_VERSION) {
      // key order differences in input string vs canonical — compare to again
      if (expectedHash && expectedHash !== again.payloadHash) {
        reasonCodes.push(EncodingErrorCode.HASH_MISMATCH);
      }
    }
    return {
      processId,
      processType,
      schemaVersion,
      body: normalized,
      payloadHash: again.payloadHash,
      valid: reasonCodes.length === 0,
      reasonCodes,
    };
  } catch (e) {
    if (e instanceof EncodingError) {
      return {
        processId,
        processType,
        schemaVersion,
        body: { institutionId: '' },
        payloadHash: recomputed,
        valid: false,
        reasonCodes: [e.code, ...(e.details ?? [])],
      };
    }
    return {
      processId,
      processType,
      schemaVersion,
      body: { institutionId: '' },
      payloadHash: recomputed,
      valid: false,
      reasonCodes: [EncodingErrorCode.DECODE_FAILED],
    };
  }
}

/**
 * Verify that payloadHash is SHA-256 of encoded bytes.
 */
export function verifyEncodedPackage(pkg: EncodedProcessTx): boolean {
  return sha256HexUtf8(pkg.encoded) === pkg.payloadHash;
}

/**
 * Domain-separated digest for external signatures over a package
 * (e.g. institution signs package before hand-off).
 */
export function packageSigningDigest(pkg: EncodedProcessTx): string {
  const material = canonicalEncode({
    domain: 'AST-TX-PACKAGE-v1',
    contentType: pkg.contentType,
    payloadHash: pkg.payloadHash,
    processId: pkg.processId,
    processType: pkg.processType,
    schemaVersion: pkg.schemaVersion,
  });
  return sha256HexUtf8(material);
}
