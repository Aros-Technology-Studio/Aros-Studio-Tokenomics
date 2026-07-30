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

/**
 * Extract institution segment from AST-{INST}-{YYYYMMDD}-{suffix}.
 * Returns uppercase INST or null if pattern invalid.
 */
export function institutionIdFromProcessId(processId: string): string | null {
  if (!processId?.trim()) return null;
  const m = processId
    .trim()
    .match(/^AST-([A-Z0-9]+)-\d{8}-[A-Z0-9]+$/i);
  return m ? m[1].toUpperCase() : null;
}

/** True if processId is owned by institution (Canon processId shape). */
export function processOwnedByInstitution(
  processId: string | null | undefined,
  institutionId: string,
): boolean {
  if (!processId?.trim() || !institutionId?.trim()) return false;
  const inst = institutionIdFromProcessId(processId);
  return inst != null && inst === institutionId.trim().toUpperCase();
}

export function assertValidProcessId(processId: string): void {
  if (!isValidProcessId(processId)) {
    throw new Error(
      `invalid processId (expect AST-{INST}-{YYYYMMDD}-{suffix}): ${processId}`,
    );
  }
}
