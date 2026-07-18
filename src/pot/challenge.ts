import type { NodechainService } from '../nodechain/nodechain.service';
import { PotReason } from './reason-codes';

/**
 * Pre-verdict challenges: any open challenge for processId blocks verified=1.
 * Challenges are journal records (param_change kind pot_challenge or pot_challenge_open).
 */
export async function hasOpenChallenge(
  nodechain: NodechainService,
  processId: string,
): Promise<{ open: boolean; reasonCodes: string[] }> {
  const history = await nodechain.listByProcessId(processId);
  let openCount = 0;
  for (const r of history) {
    if (r.recordType !== 'param_change') continue;
    const kind = r.payload?.kind;
    if (kind === 'pot_challenge_open') openCount += 1;
    if (kind === 'pot_challenge_close') openCount = Math.max(0, openCount - 1);
  }
  if (openCount > 0) {
    return { open: true, reasonCodes: [PotReason.CHALLENGE_OPEN] };
  }
  return { open: false, reasonCodes: [] };
}

export async function openChallenge(
  nodechain: NodechainService,
  processId: string,
  challengerId: string,
  reason: string,
): Promise<void> {
  await nodechain.append({
    clientRecordId: `pot-challenge-open:${processId}:${challengerId}:${Date.now()}`,
    recordType: 'param_change',
    processId,
    payload: {
      kind: 'pot_challenge_open',
      challengerId,
      reason,
      at: new Date().toISOString(),
    },
    writerId: 'pot',
    writerRole: 'pot',
  });
}

export async function closeChallenge(
  nodechain: NodechainService,
  processId: string,
  closerId: string,
  resolution: string,
): Promise<void> {
  await nodechain.append({
    clientRecordId: `pot-challenge-close:${processId}:${closerId}:${Date.now()}`,
    recordType: 'param_change',
    processId,
    payload: {
      kind: 'pot_challenge_close',
      closerId,
      resolution,
      at: new Date().toISOString(),
    },
    writerId: 'pot',
    writerRole: 'pot',
  });
}
