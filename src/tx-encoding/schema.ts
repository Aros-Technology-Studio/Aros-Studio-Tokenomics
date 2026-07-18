import { isValidProcessId } from '../intake/process-id';
import { EncodingError, EncodingErrorCode } from './errors';
import type { ProcessTxBody, ProcessTxInput, ProcessTypeId } from './types';

export interface FieldSpec {
  name: string;
  required: boolean;
  kind: 'string' | 'amount' | 'processId' | 'hash';
}

export interface ProcessTxSchema {
  processType: ProcessTypeId;
  fields: FieldSpec[];
  /** If false, unknown keys rejected. */
  allowExtraKeys: boolean;
}

const AMOUNT_RE = /^-?\d+(\.\d{1,9})?$/;
const HASH_RE = /^[a-f0-9]{64}$/i;

const SCHEMAS: Record<string, ProcessTxSchema> = {
  primary_tokenization: {
    processType: 'primary_tokenization',
    allowExtraKeys: false,
    fields: [
      { name: 'institutionId', required: true, kind: 'string' },
      { name: 'valuation', required: true, kind: 'amount' },
      { name: 'holderId', required: true, kind: 'string' },
      { name: 'assetId', required: false, kind: 'string' },
      { name: 'documentPackageHash', required: false, kind: 'hash' },
    ],
  },
  revaluation: {
    processType: 'revaluation',
    allowExtraKeys: false,
    fields: [
      { name: 'institutionId', required: true, kind: 'string' },
      { name: 'assetId', required: true, kind: 'string' },
      { name: 'previousValue', required: true, kind: 'amount' },
      { name: 'newValue', required: true, kind: 'amount' },
      { name: 'documentPackageHash', required: false, kind: 'hash' },
    ],
  },
  ownership_transfer: {
    processType: 'ownership_transfer',
    allowExtraKeys: false,
    fields: [
      { name: 'institutionId', required: true, kind: 'string' },
      { name: 'assetId', required: true, kind: 'string' },
      { name: 'fromHolderId', required: true, kind: 'string' },
      { name: 'toHolderId', required: true, kind: 'string' },
      { name: 'amount', required: true, kind: 'amount' },
      { name: 'documentPackageHash', required: false, kind: 'hash' },
    ],
  },
  partial_release: {
    processType: 'partial_release',
    allowExtraKeys: false,
    fields: [
      { name: 'institutionId', required: true, kind: 'string' },
      { name: 'holderId', required: true, kind: 'string' },
      { name: 'releaseAmount', required: true, kind: 'amount' },
      { name: 'remintAmount', required: false, kind: 'amount' },
      { name: 'assetId', required: false, kind: 'string' },
      { name: 'parentProcessId', required: false, kind: 'string' },
      { name: 'parentClaimId', required: false, kind: 'string' },
      { name: 'documentPackageHash', required: false, kind: 'hash' },
    ],
  },
};

export function getSchema(processType: string): ProcessTxSchema {
  const s = SCHEMAS[processType];
  if (!s) {
    // Unknown types: minimal required institutionId only, extra keys forbidden
    return {
      processType,
      allowExtraKeys: false,
      fields: [{ name: 'institutionId', required: true, kind: 'string' }],
    };
  }
  return s;
}

export function listSchemas(): ProcessTxSchema[] {
  return Object.values(SCHEMAS);
}

/**
 * Validate and normalize body (trim strings, reject floats/scientific amounts).
 */
export function validateAndNormalize(input: ProcessTxInput): ProcessTxBody {
  const errors: string[] = [];
  if (!input.processId || !isValidProcessId(input.processId)) {
    throw new EncodingError(
      EncodingErrorCode.INVALID_PROCESS_ID,
      `invalid processId: ${input.processId}`,
    );
  }
  if (!input.processType?.trim()) {
    throw new EncodingError(EncodingErrorCode.INVALID_PROCESS_TYPE, 'processType required');
  }
  if (!input.body || typeof input.body !== 'object' || Array.isArray(input.body)) {
    throw new EncodingError(EncodingErrorCode.EMPTY_BODY, 'body object required');
  }

  const schema = getSchema(input.processType);
  const raw = input.body;
  const allowed = new Set(schema.fields.map((f) => f.name));

  if (!schema.allowExtraKeys) {
    for (const k of Object.keys(raw)) {
      if (!allowed.has(k)) {
        errors.push(`forbidden field: ${k}`);
      }
    }
  }

  const out: ProcessTxBody = { institutionId: '' };

  for (const field of schema.fields) {
    const v = raw[field.name];
    if (v === undefined || v === null || v === '') {
      if (field.required) errors.push(`missing field: ${field.name}`);
      continue;
    }
    if (typeof v !== 'string') {
      errors.push(`field ${field.name} must be string (no numbers/floats)`);
      continue;
    }
    const s = v.trim();
    if (!s) {
      if (field.required) errors.push(`missing field: ${field.name}`);
      continue;
    }
    if (field.kind === 'amount' && !AMOUNT_RE.test(s)) {
      errors.push(`invalid amount ${field.name}: use decimal string max 9 fraction digits`);
      continue;
    }
    if (field.kind === 'hash' && !HASH_RE.test(s)) {
      errors.push(`invalid hash ${field.name}: expect 64 hex chars`);
      continue;
    }
    if (field.kind === 'string' && s.length > 256) {
      errors.push(`field ${field.name} too long`);
      continue;
    }
    out[field.name] = field.kind === 'hash' ? s.toLowerCase() : s;
  }

  if (errors.length) {
    throw new EncodingError(
      EncodingErrorCode.SCHEMA,
      `schema validation failed: ${errors.join('; ')}`,
      errors,
    );
  }

  // ownership transfer: from !== to
  if (
    input.processType === 'ownership_transfer' &&
    out.fromHolderId &&
    out.toHolderId &&
    out.fromHolderId === out.toHolderId
  ) {
    throw new EncodingError(EncodingErrorCode.SCHEMA, 'fromHolderId must differ from toHolderId');
  }

  return out;
}
