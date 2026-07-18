import { isValidDocumentPackageHash, isValidValuation } from './amounts';
import { isValidIdempotencyKey } from './idempotency';
import { isValidProcessId } from './process-id';
import type { CreateProcessBody, PortalErrorBody } from './types';

/**
 * Edge admission: institutional valuation + qualified signature + docs + idempotency.
 * Does not run PoT or mint.
 */
export function validateCreateProcess(
  body: CreateProcessBody,
  idempotencyKey: string | undefined,
  institutionId: string | undefined,
): PortalErrorBody | null {
  if (!institutionId?.trim()) {
    return { code: 'FORBIDDEN', message: 'X-Institution-Id required' };
  }
  if (!isValidIdempotencyKey(idempotencyKey)) {
    return {
      code: 'IDEMPOTENCY_REQUIRED',
      message: 'Idempotency-Key header required (8–128 chars)',
    };
  }
  if (!body?.processType) {
    return { code: 'VALIDATION_ERROR', message: 'processType required' };
  }
  if (!isValidValuation(body.valuation)) {
    return {
      code: 'MISSING_VALUATION',
      message: 'institutional valuation required as decimal string (max 9 fraction digits)',
    };
  }
  if (body.hasQualifiedSignature !== true) {
    return {
      code: 'MISSING_QUALIFIED_SIGNATURE',
      message: 'hasQualifiedSignature must be true (qualified institutional signature)',
    };
  }
  if (!isValidDocumentPackageHash(body.documentPackageHash)) {
    return {
      code: 'MISSING_DOCUMENTS',
      message: 'documentPackageHash required (64 hex SHA-256 of package)',
    };
  }
  if (!body.holderId?.trim()) {
    return { code: 'VALIDATION_ERROR', message: 'holderId required' };
  }
  if (body.processId && !isValidProcessId(body.processId)) {
    return {
      code: 'INVALID_PROCESS_ID',
      message: 'processId must match AST-{INST}-{YYYYMMDD}-{suffix}',
    };
  }
  return null;
}
