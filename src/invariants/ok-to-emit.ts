import type { NodechainService } from '../nodechain/nodechain.service';
import {
  assertCriteriaP1P4,
  assertI1_poTVerified,
  assertI2_processBound,
  assertI3_nodeChainRecorded,
  type CriteriaFlags,
} from './asserts';
import { InvariantId } from './codes';
import { InvariantError } from './errors';

export interface OkToEmit {
  processId: string;
  potVerified: 1;
  potLedgerHeight: number;
  evidenceHeight: number;
  verdictRecordId: string;
  criteriaResult: CriteriaFlags;
  okToEmit: true;
}

/**
 * Fail-closed gate before any emission path.
 * Requires NodeChain-recorded pot_evidence then pot_verdict with verified=1
 * and criteriaResult P1–P4 all true (Core Canon §4.2 + §XI I1–I3).
 */
export async function resolveOkToEmit(
  nodechain: NodechainService,
  processId: string,
): Promise<OkToEmit> {
  assertI2_processBound(processId);

  const history = await nodechain.listByProcessId(processId);
  assertI3_nodeChainRecorded(history.length > 0, 'no NodeChain history for process');

  const evidence = history.find((r) => r.recordType === 'pot_evidence');
  assertI3_nodeChainRecorded(!!evidence, 'pot_evidence not recorded on NodeChain');

  const verdicts = history.filter((r) => r.recordType === 'pot_verdict');
  assertI3_nodeChainRecorded(verdicts.length > 0, 'pot_verdict not recorded on NodeChain');

  // Write-ahead: evidence height must be strictly before final positive verdict
  const positive = [...verdicts].reverse().find((r) => r.payload?.verified === 1);
  if (!positive) {
    throw new InvariantError(
      InvariantId.I1,
      'I1 fail-closed: no pot_verdict with verified=1 on NodeChain',
    );
  }

  if (evidence!.height >= positive.height) {
    throw new InvariantError(
      InvariantId.I3,
      'I3 fail-closed: pot_evidence must be recorded before pot_verdict (write-ahead)',
      [`evidenceHeight=${evidence!.height}`, `verdictHeight=${positive.height}`],
    );
  }

  const verified = positive.payload.verified === 1 ? 1 : 0;
  assertI1_poTVerified(verified);

  const criteriaResult = (positive.payload.criteriaResult ?? {}) as CriteriaFlags;
  assertCriteriaP1P4(criteriaResult);

  return {
    processId,
    potVerified: 1,
    potLedgerHeight: positive.height,
    evidenceHeight: evidence!.height,
    verdictRecordId: positive.recordId,
    criteriaResult: {
      P1: !!criteriaResult.P1,
      P2: !!criteriaResult.P2,
      P3: !!criteriaResult.P3,
      P4: !!criteriaResult.P4,
    },
    okToEmit: true,
  };
}

/**
 * Synchronous fail-closed check when caller already has a verdict object
 * (still prefer resolveOkToEmit which reads the journal).
 */
export function assertOkToEmitFromVerdict(input: {
  processId: string;
  verified: 0 | 1;
  criteriaResult?: CriteriaFlags;
  evidenceHeight?: number;
  ledgerHeight?: number;
}): void {
  assertI2_processBound(input.processId);
  assertI1_poTVerified(input.verified);
  assertCriteriaP1P4(input.criteriaResult);
  if (
    input.evidenceHeight !== undefined &&
    input.ledgerHeight !== undefined &&
    input.evidenceHeight >= input.ledgerHeight
  ) {
    throw new InvariantError(
      InvariantId.I3,
      'I3 fail-closed: evidence must precede verdict on ledger',
    );
  }
}
