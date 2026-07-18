import { randomUUID } from 'crypto';

/**
 * Core Canon / Orchestrator processId:
 * AST-{INST}-{YYYYMMDD}-{suffix}
 */
export const PROCESS_ID_PATTERN = /^AST-[A-Z0-9]+-\d{8}-[A-Z0-9]+$/i;

export function makeProcessId(institutionId: string, date = new Date()): string {
  const inst =
    institutionId
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 16) || 'UNK';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  // Opaque suffix (UUIDv4 hex fragment; Orchestrator pack may use UUIDv7)
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);
  return `AST-${inst}-${y}${m}${d}-${suffix}`;
}

export function isValidProcessId(processId: string): boolean {
  return typeof processId === 'string' && PROCESS_ID_PATTERN.test(processId);
}

export function assertValidProcessId(processId: string): void {
  if (!isValidProcessId(processId)) {
    throw new Error(
      `invalid processId (expect AST-{INST}-{YYYYMMDD}-{suffix}): ${processId}`,
    );
  }
}
