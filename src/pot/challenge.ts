import type { NodechainService } from '../nodechain/nodechain.service';
import { PotReason } from './reason-codes';

/**
 * Pre-verdict challenges: any open challenge for processId blocks verified=1.
 * Journaled as process-scoped pot_challenge_open / pot_challenge_close
 * (param_change kind still accepted for older journals).
 */
export async function hasOpenChallenge(
  nodechain: NodechainService,
  processId: string,
): Promise<{ open: boolean; openCount: number; reasonCodes: string[] }> {
  const history = await nodechain.listByProcessId(processId);
  let openCount = 0;
  for (const r of history) {
    if (r.recordType === 'pot_challenge_open') {
      openCount += 1;
      continue;
    }
    if (r.recordType === 'pot_challenge_close') {
      openCount = Math.max(0, openCount - 1);
      continue;
    }
    if (r.recordType === 'param_change') {
      const kind = r.payload?.kind;
      if (kind === 'pot_challenge_open') openCount += 1;
      if (kind === 'pot_challenge_close') openCount = Math.max(0, openCount - 1);
    }
  }
  if (openCount > 0) {
    return { open: true, openCount, reasonCodes: [PotReason.CHALLENGE_OPEN] };
  }
  return { open: false, openCount: 0, reasonCodes: [] };
}

export async function openChallenge(
  nodechain: NodechainService,
  processId: string,
  challengerId: string,
  reason: string,
): Promise<{ recordId: string; height: number }> {
  if (!challengerId?.trim()) {
    throw new Error('challengerId required');
  }
  if (!reason?.trim()) {
    throw new Error('challenge reason required');
  }
  const r = await nodechain.append({
    clientRecordId: `pot-challenge-open:${processId}:${challengerId}:${Date.now()}`,
    recordType: 'pot_challenge_open',
    processId,
    payload: {
      kind: 'pot_challenge_open',
      challengerId: challengerId.trim(),
      reason: reason.trim(),
      at: new Date().toISOString(),
    },
    writerId: 'pot',
    writerRole: 'pot',
  });
  return { recordId: r.recordId, height: r.height };
}

export async function closeChallenge(
  nodechain: NodechainService,
  processId: string,
  closerId: string,
  resolution: string,
): Promise<{ recordId: string; height: number }> {
  if (!closerId?.trim()) {
    throw new Error('closerId required');
  }
  const open = await hasOpenChallenge(nodechain, processId);
  if (!open.open) {
    throw new Error(`no open challenge for ${processId}`);
  }
  const r = await nodechain.append({
    clientRecordId: `pot-challenge-close:${processId}:${closerId}:${Date.now()}`,
    recordType: 'pot_challenge_close',
    processId,
    payload: {
      kind: 'pot_challenge_close',
      closerId: closerId.trim(),
      resolution: resolution.trim(),
      at: new Date().toISOString(),
    },
    writerId: 'pot',
    writerRole: 'pot',
  });
  return { recordId: r.recordId, height: r.height };
}
