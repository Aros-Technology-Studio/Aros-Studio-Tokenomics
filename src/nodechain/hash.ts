import { createHash } from 'crypto';
import type { JournalRecord, RecordSignature } from './types';

export function sha256Hex(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/** Deterministic JSON: sorted keys, no insignificant space. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    out[key] = sortKeys(obj[key]);
  }
  return out;
}

export function computeContentHash(input: {
  schemaVersion: string;
  recordType: string;
  processId: string | null;
  payload: Record<string, unknown>;
}): string {
  const material = canonicalJson({
    schemaVersion: input.schemaVersion,
    recordType: input.recordType,
    processId: input.processId,
    payload: input.payload });
  return sha256Hex(material);
}

/**
 * Envelope hash chains the journal. Signatures are attached evidence and are
 * intentionally excluded so signing does not change the chain id.
 */
export function computeEnvelopeHash(input: {
  recordId: string;
  schemaVersion: string;
  recordType: string;
  processId: string | null;
  writerId: string;
  writerRole: string;
  timestampUtc: string;
  prevHash: string;
  contentHash: string;
  height: number;
  payload: Record<string, unknown>;
  signatures?: RecordSignature[];
}): string {
  const material = canonicalJson({
    recordId: input.recordId,
    schemaVersion: input.schemaVersion,
    recordType: input.recordType,
    processId: input.processId,
    writerId: input.writerId,
    writerRole: input.writerRole,
    timestampUtc: input.timestampUtc,
    prevHash: input.prevHash,
    contentHash: input.contentHash,
    height: input.height,
    payload: input.payload });
  return sha256Hex(material);
}

export function verifyChainLink(
  prev: JournalRecord | null,
  current: JournalRecord,
  genesisPrevHash: string,
): boolean {
  if (prev === null) {
    return (
      current.height === 0 &&
      current.prevHash === genesisPrevHash &&
      current.envelopeHash ===
        computeEnvelopeHash({
          recordId: current.recordId,
          schemaVersion: current.schemaVersion,
          recordType: current.recordType,
          processId: current.processId,
          writerId: current.writerId,
          writerRole: current.writerRole,
          timestampUtc: current.timestampUtc,
          prevHash: current.prevHash,
          contentHash: current.contentHash,
          height: current.height,
          payload: current.payload,
          signatures: current.signatures })
    );
  }
  return (
    current.height === prev.height + 1 &&
    current.prevHash === prev.envelopeHash &&
    current.envelopeHash ===
      computeEnvelopeHash({
        recordId: current.recordId,
        schemaVersion: current.schemaVersion,
        recordType: current.recordType,
        processId: current.processId,
        writerId: current.writerId,
        writerRole: current.writerRole,
        timestampUtc: current.timestampUtc,
        prevHash: current.prevHash,
        contentHash: current.contentHash,
        height: current.height,
        payload: current.payload,
        signatures: current.signatures })
  );
}
