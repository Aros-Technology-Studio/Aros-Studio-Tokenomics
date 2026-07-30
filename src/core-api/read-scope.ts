/**
 * Core HTTP read authorization for NodeChain (B3).
 *
 * - ops (X-Ops-Token = AST_OPS_READ_TOKEN): full journal
 * - institution (X-Institution-Id + Token): own processes only + system rows
 * - anonymous: full if AST_NODECHAIN_PUBLIC_READ=1 (default pilot explorer);
 *              system-only metadata if public read off
 */
import { HttpException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { InstitutionAuthService } from '../intake/institution-auth';
import { processOwnedByInstitution } from '../common/process-id';
import type { JournalRecord } from '../nodechain/types';

export type ReadPrincipal =
  | { kind: 'ops' }
  | { kind: 'institution'; institutionId: string }
  | { kind: 'anonymous' };

const SYSTEM_RECORD_TYPES = new Set([
  'genesis',
  'system_boot',
  'kill_switch',
  'param_change',
]);

export function publicNodechainReadEnabled(): boolean {
  const v = (process.env.AST_NODECHAIN_PUBLIC_READ ?? '1').trim().toLowerCase();
  return !(v === '0' || v === 'false' || v === 'off' || v === 'no');
}

function tokensEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function resolveReadPrincipal(
  headers: {
    institutionId?: string;
    institutionToken?: string;
    opsToken?: string;
  },
  auth: InstitutionAuthService = new InstitutionAuthService(),
): ReadPrincipal {
  const opsExpected = process.env.AST_OPS_READ_TOKEN?.trim();
  if (opsExpected && headers.opsToken?.trim()) {
    if (!tokensEqual(opsExpected, headers.opsToken.trim())) {
      throw new HttpException(
        { code: 'E_UNAUTHORIZED', message: 'invalid ops read token' },
        401,
      );
    }
    return { kind: 'ops' };
  }

  if (headers.institutionId?.trim() || headers.institutionToken?.trim()) {
    const r = auth.authenticate(headers.institutionId, headers.institutionToken);
    if (!r.ok) {
      throw new HttpException({ code: r.code, message: r.message }, 401);
    }
    return { kind: 'institution', institutionId: r.institutionId };
  }

  return { kind: 'anonymous' };
}

export function isSystemJournalRow(record: {
  processId?: string | null;
  recordType?: string;
  type?: string;
}): boolean {
  const pid = record.processId;
  if (pid == null || pid === '') return true;
  const t = record.recordType ?? record.type ?? '';
  return SYSTEM_RECORD_TYPES.has(t);
}

export function canReadProcess(
  principal: ReadPrincipal,
  processId: string,
): boolean {
  if (principal.kind === 'ops') return true;
  if (principal.kind === 'anonymous') return publicNodechainReadEnabled();
  return processOwnedByInstitution(processId, principal.institutionId);
}

export function canReadRecord(
  principal: ReadPrincipal,
  record: JournalRecord,
): boolean {
  if (principal.kind === 'ops') return true;
  if (isSystemJournalRow(record)) return true;
  if (principal.kind === 'anonymous') return publicNodechainReadEnabled();
  if (!record.processId) return true;
  return processOwnedByInstitution(record.processId, principal.institutionId);
}

/**
 * Filter nodes list for principal. Institution: system + own processes.
 * Anonymous with public off: system rows only (no foreign process payloads).
 */
export function filterNodesForPrincipal<
  T extends { processId?: string | null; type?: string; payload?: unknown },
>(principal: ReadPrincipal, nodes: T[]): T[] {
  if (principal.kind === 'ops') return nodes;
  if (principal.kind === 'anonymous' && publicNodechainReadEnabled()) return nodes;

  return nodes
    .filter((n) => {
      if (isSystemJournalRow(n)) return true;
      if (principal.kind === 'institution' && n.processId) {
        return processOwnedByInstitution(n.processId, principal.institutionId);
      }
      return false;
    })
    .map((n) => {
      if (principal.kind === 'institution' && n.processId) {
        return n;
      }
      if (isSystemJournalRow(n)) {
        // strip heavy payloads for anonymous restricted mode
        if (principal.kind === 'anonymous' && n.payload != null) {
          return { ...n, payload: undefined };
        }
      }
      return n;
    });
}

export function assertCanReadProcess(
  principal: ReadPrincipal,
  processId: string,
): void {
  if (canReadProcess(principal, processId)) return;
  // 404 — do not leak existence of foreign processes
  throw new HttpException(
    { code: 'E_NOT_FOUND', message: `no process ${processId}` },
    404,
  );
}

export function assertCanReadRecord(
  principal: ReadPrincipal,
  record: JournalRecord,
): void {
  if (canReadRecord(principal, record)) return;
  throw new HttpException(
    { code: 'E_NOT_FOUND', message: `no record ${record.recordId}` },
    404,
  );
}
