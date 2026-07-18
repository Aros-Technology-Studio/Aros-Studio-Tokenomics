import type { NodechainService } from '../nodechain/nodechain.service';
import type { ProcessState } from '../processing/process.service';
import { evaluateCriteria } from './criteria';
import { evaluateQuorum, quorumOk } from './quorum';
import { buildEvidence } from './evidence-builder';
import { PotReason } from './reason-codes';
import {
  defaultPotConfig,
  POT_VERDICT_SCHEMA,
  PotError,
  type PotConfig,
  type PotVerdict,
} from './types';

/**
 * Layer 04 — Proof of Transaction.
 * Sole value gate: P1–P4 + quorum + timeout → binary verified, journaled write-ahead.
 * No amount math. No Eye veto.
 */
export class PotService {
  private readonly config: PotConfig;

  constructor(
    private readonly nodechain: NodechainService,
    config: Partial<PotConfig> = {},
  ) {
    this.config = { ...defaultPotConfig, ...config };
  }

  /** Pure criteria — exposed for tests and auditors. */
  evaluateCriteria = evaluateCriteria;

  /** Pure quorum. */
  quorumOk = quorumOk;
  evaluateQuorum = evaluateQuorum;

  /**
   * Read final positive verdict from journal, if any.
   */
  async getFinalVerdict(processId: string): Promise<PotVerdict | null> {
    const history = await this.nodechain.listByProcessId(processId);
    const verdicts = history.filter((r) => r.recordType === 'pot_verdict');
    for (let i = verdicts.length - 1; i >= 0; i--) {
      const p = verdicts[i].payload as Record<string, unknown>;
      if (p.verified === 1 && p.final === true) {
        return this.payloadToVerdict(processId, verdicts[i].recordId, verdicts[i].height, p);
      }
    }
    return null;
  }

  /**
   * Full verification path.
   */
  async verify(
    process: ProcessState,
    confirmers: string[],
    validatorIds: string[] = ['v1', 'v2', 'v3'],
  ): Promise<PotVerdict> {
    if (!process?.processId) {
      throw new PotError(PotReason.POT_INVALID_INPUT, 'processId required');
    }

    const existing = await this.getFinalVerdict(process.processId);
    if (existing) {
      throw new PotError(
        PotReason.POT_ALREADY_FINAL,
        `process ${process.processId} already has final verified=1`,
      );
    }

    // Also block if any prior verified=1 even without final flag (legacy rows)
    const history = await this.nodechain.listByProcessId(process.processId);
    const priorPositive = history.find(
      (r) => r.recordType === 'pot_verdict' && r.payload?.verified === 1,
    );
    if (priorPositive) {
      throw new PotError(
        PotReason.POT_DOUBLE_CONFIRM,
        `process ${process.processId} already has verified=1 verdict`,
      );
    }

    const evidence = await buildEvidence(
      this.nodechain,
      process,
      confirmers,
      validatorIds,
      this.config.requiredStages,
    );

    const { criteriaResult, reasonCodes, pass } = evaluateCriteria(evidence);
    const codes = [...reasonCodes];

    let expired = false;
    if (evidence.openedAtUtc) {
      const opened = Date.parse(evidence.openedAtUtc);
      if (Number.isFinite(opened) && Date.now() - opened > this.config.timeoutMs) {
        expired = true;
        codes.push(PotReason.POT_TIMEOUT);
      }
    }

    const quorum = evaluateQuorum(
      confirmers,
      validatorIds,
      this.config.quorumRatio,
      this.config.kMin,
    );
    codes.push(...quorum.reasonCodes);

    const verified: 0 | 1 = pass && quorum.ok && !expired ? 1 : 0;
    const final = verified === 1;

    const evidenceWrite = await this.nodechain.append({
      clientRecordId: `pot-evidence:${process.processId}`,
      recordType: 'pot_evidence',
      processId: process.processId,
      payload: {
        ...evidence,
        criteriaResult,
        reasonCodes: codes,
        quorum,
      },
      writerId: 'pot',
      writerRole: 'pot',
    });

    const verdictWrite = await this.nodechain.append({
      clientRecordId: `pot-verdict:${process.processId}`,
      recordType: 'pot_verdict',
      processId: process.processId,
      payload: {
        schemaVersion: POT_VERDICT_SCHEMA,
        verified,
        reasonCodes: codes,
        criteriaResult,
        quorum,
        evidenceRecordId: evidenceWrite.recordId,
        evidenceHeight: evidenceWrite.height,
        validatorIds,
        confirmers,
        tipHeight: evidence.tipHeight,
        tipHash: evidence.tipHash,
        final,
        expired,
      },
      writerId: 'pot',
      writerRole: 'pot',
    });

    return {
      processId: process.processId,
      schemaVersion: POT_VERDICT_SCHEMA,
      verified,
      reasonCodes: codes,
      criteriaResult,
      quorum,
      evidenceRecordId: evidenceWrite.recordId,
      evidenceHeight: evidenceWrite.height,
      verdictRecordId: verdictWrite.recordId,
      ledgerHeight: verdictWrite.height,
      validatorIds,
      confirmers,
      tipHeight: evidence.tipHeight,
      tipHash: evidence.tipHash,
      final,
      expired,
    };
  }

  private payloadToVerdict(
    processId: string,
    recordId: string,
    height: number,
    p: Record<string, unknown>,
  ): PotVerdict {
    return {
      processId,
      schemaVersion: POT_VERDICT_SCHEMA,
      verified: p.verified === 1 ? 1 : 0,
      reasonCodes: (p.reasonCodes as string[]) ?? [],
      criteriaResult: (p.criteriaResult as PotVerdict['criteriaResult']) ?? {
        P1: false,
        P2: false,
        P3: false,
        P4: false,
      },
      quorum: (p.quorum as PotVerdict['quorum']) ?? {
        ok: false,
        K: 0,
        Q: 0,
        confirmerCount: 0,
        reasonCodes: [],
      },
      evidenceRecordId: String(p.evidenceRecordId ?? ''),
      evidenceHeight: Number(p.evidenceHeight ?? -1),
      verdictRecordId: recordId,
      ledgerHeight: height,
      validatorIds: (p.validatorIds as string[]) ?? [],
      confirmers: (p.confirmers as string[]) ?? [],
      tipHeight: Number(p.tipHeight ?? -1),
      tipHash: String(p.tipHash ?? ''),
      final: p.final === true,
      expired: p.expired === true,
    };
  }
}
