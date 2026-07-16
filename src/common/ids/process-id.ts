import { randomBytes } from 'crypto';

/**
 * processId = AST-{INST}-{YYYYMMDD}-<UUIDv7>
 * CANON §XII / orchestrator pack.
 */
export function formatUtcYyyymmdd(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/** RFC-ish UUID version 7 (time-ordered). */
export function uuidv7(now: Date = new Date()): string {
  const ms = BigInt(now.getTime());
  const bytes = randomBytes(16);

  // 48-bit unix timestamp ms
  bytes[0] = Number((ms >> 40n) & 0xffn);
  bytes[1] = Number((ms >> 32n) & 0xffn);
  bytes[2] = Number((ms >> 24n) & 0xffn);
  bytes[3] = Number((ms >> 16n) & 0xffn);
  bytes[4] = Number((ms >> 8n) & 0xffn);
  bytes[5] = Number(ms & 0xffn);

  // version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // variant 10
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const INST_RE = /^[A-Z0-9]{2,32}$/;

export function buildProcessId(institutionCode: string, now: Date = new Date()): string {
  const inst = institutionCode.trim().toUpperCase();
  if (!INST_RE.test(inst)) {
    throw new Error('INVALID_INSTITUTION_CODE');
  }
  return `AST-${inst}-${formatUtcYyyymmdd(now)}-${uuidv7(now)}`;
}

export function isValidProcessId(processId: string): boolean {
  return /^AST-[A-Z0-9]+-\d{8}-[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    processId,
  );
}
