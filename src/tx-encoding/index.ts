/**
 * Layer 02 — TxEncoding public surface.
 */
export {
  encodeProcessTx,
  decodeProcessTx,
  verifyEncodedPackage,
  packageSigningDigest,
  canonicalEncode,
} from './encode';
export { EncodingService, type SignedPackage } from './encoding.service';
export { EncodingError, EncodingErrorCode } from './errors';
export { getSchema, listSchemas, validateAndNormalize } from './schema';
export { payloadHash, sha256HexUtf8 } from './hash';
export {
  TX_SCHEMA_VERSION,
  TX_CONTENT_TYPE,
  type ProcessTypeId,
  type ProcessTxBody,
  type ProcessTxInput,
  type EncodedProcessTx,
  type DecodeResult,
} from './types';
