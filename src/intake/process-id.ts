import { randomUUID } from 'crypto';

/**
 * AST processId pattern: AST-{INST}-{YYYYMMDD}-{suffix}
 */
export function makeProcessId(institutionId: string, date = new Date()): string {
  const inst = institutionId
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 16) || 'UNK';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);
  return `AST-${inst}-${y}${m}${d}-${suffix}`;
}

export function isValidProcessId(processId: string): boolean {
  // AST-{INST}-{YYYYMMDD}-{suffix} — suffix alnum (uuid fragment or test id)
  return /^AST-[A-Z0-9]+-\d{8}-[A-Z0-9]+$/i.test(processId);
}
