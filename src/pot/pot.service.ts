import type { NodechainService } from '../nodechain/nodechain.service';
import type { ProcessState } from '../processing/process.service';
import type { KeyRegistry } from '../common/crypto/key-registry';
import { evaluateCriteria } from './criteria';
import { evaluateQuorum, quorumOk } from './quorum';
import { buildEvidence } from './evidence-builder';
import { evaluateTimeout } from './timeout';
import { hasOpenChallenge, openChallenge, closeChallenge } from './challenge';
import {
  attestationDigest,
  signAttestation,
  verifyAttestations,
  type ConfirmerAttestation,
} from './attestation';
import { ValidatorRegistry } from './validator-registry';
import { PotReason } from './reason-codes';
import {
  defaultPotConfig,
  POT_VERDICT_SCHEMA,
  PotError,
  type PotConfig,
  type PotVerdict,
} from './types';

export interface VerifyInput {
  process: ProcessState;
  /** Confirmer attestations (Ed25519). Prefer this over bare confirmer ids. */
  attestations?: ConfirmerAttestation[];
  /** Fallback confirmer ids only if requireAttestations=false. */
  confirmers?: string[];
  /** Proposed validator set; filtered by registry when non-empty. */
  validatorIds?: string[];
  keys: KeyRegistry;
  nowMs?: number;
}

/**
 * Layer 04 — Proof of Transaction (full).
 * P1–P4 + signed attestations + quorum + timeout + challenge gate.
 * Write-ahead pot_evidence then pot_verdict. No amount math. No Eye veto.
 */
export class PotService {
  private readonly config: PotConfig;
  readonly validators: ValidatorRegistry;

  constructor(
    private readonly nodechain: NodechainService,
    config: Partial<PotConfig> = {},
    validators?: ValidatorRegistry,
  ) {
    this.config = { ...defaultPotConfig, ...config };
    this.validators = validators ?? new ValidatorRegistry();
  }

  evaluateCriteria = evaluateCriteria;
  quorumOk = quorumOk;
  evaluateQuorum = evaluateQuorum;
  openChallenge = (processId: string, challengerId: string, reason: string) =>
    openChallenge(this.nodechain, processId, challengerId, reason);
  closeChallenge = (processId: string, closerId: string, resolution: string) =>
    closeChallenge(this.nodechain, processId, closerId, resolution);

  /**
   * Build digest and sign attestations for each confirmer key id.
   */
  createAttestations(
    keys: KeyRegistry,
    process: ProcessState,
    tipHash: string,
    tipHeight: number,
    confirmerIds: string[],
    flags: {
      institutionAllowlisted: boolean;
      hasDocuments: boolean;
      hasQualifiedSignature: boolean;
      stagesCompleted: string[];
    },
  ): ConfirmerAttestation[] {
    const digest = attestationDigest({
      processId: process.processId,
      processType: process.processType,
      tipHash,
      tipHeight,
      stagesCompleted: flags.stagesCompleted,
      institutionAllowlisted: flags.institutionAllowlisted,
      hasDocuments: flags.hasDocuments,
      hasQualifiedSignature: flags.hasQualifiedSignature,
    });
    return confirmerIds.map((id) => signAttestation(keys, id, digest));
  }

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

  async verify(input: VerifyInput): Promise<PotVerdict>;
  /** Legacy positional API — prefer VerifyInput object. */
  async verify(
    process: ProcessState,
    confirmerIds: string[],
    validatorIds?: string[],
    keys?: KeyRegistry,
  ): Promise<PotVerdict>;
  async verify(
    processOrInput: ProcessState | VerifyInput,
    confirmerIds?: string[],
    validatorIds: string[] = ['v1', 'v2', 'v3'],
    keys?: KeyRegistry,
  ): Promise<PotVerdict> {
    const input: VerifyInput =
      processOrInput && typeof processOrInput === 'object' && 'process' in processOrInput
        ? processOrInput
        : {
            process: processOrInput as ProcessState,
            confirmers: confirmerIds,
            validatorIds,
            keys: keys!,
          };

    const process = input.process;
    const keyReg = input.keys;
    if (!keyReg) {
      throw new PotError(PotReason.POT_INVALID_INPUT, 'KeyRegistry required for PoT');
    }
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

    const proposed = input.validatorIds ?? ['v1', 'v2', 'v3'];
    // Auto-register proposed validators if registry empty (test bootstrap)
    if (this.validators.listAll().length === 0) {
      this.validators.registerMany(proposed);
    }
    const eligible = this.validators.resolveEligible(proposed);
    if (eligible.length === 0) {
      throw new PotError(PotReason.VALIDATOR_SET_EMPTY, 'no eligible validators');
    }

    const tip = await this.nodechain.getTip();
    if (!tip) {
      throw new PotError(PotReason.POT_INVALID_INPUT, 'journal tip required');
    }

    // Build provisional flags/stages for digest (from journal open)
    const open = history.find((r) => r.recordType === 'process_open');
    const openPayload = (open?.payload ?? {}) as Record<string, unknown>;
    const stagesPreview = unique([
      ...process.stagesCompleted,
      ...(open ? ['opened'] : []),
      ...(openPayload.hasDocuments === true ? ['documents'] : []),
      ...(openPayload.payloadHash || process.payloadHash ? ['encoded'] : []),
    ]);

    let attestations = input.attestations ?? [];
    if (this.config.requireAttestations) {
      if (!attestations.length && input.confirmers?.length) {
        // Convenience: sign with provided confirmer ids when keys available
        attestations = this.createAttestations(keyReg, process, tip.tipHash, tip.height, input.confirmers, {
          institutionAllowlisted: openPayload.institutionAllowlisted === true,
          hasDocuments: openPayload.hasDocuments === true,
          hasQualifiedSignature: openPayload.hasQualifiedSignature === true,
          stagesCompleted: stagesPreview,
        });
      }
      const digest = attestationDigest({
        processId: process.processId,
        processType: process.processType,
        tipHash: tip.tipHash,
        tipHeight: tip.height,
        stagesCompleted: stagesPreview,
        institutionAllowlisted: openPayload.institutionAllowlisted === true,
        hasDocuments: openPayload.hasDocuments === true,
        hasQualifiedSignature: openPayload.hasQualifiedSignature === true,
      });
      const att = verifyAttestations(keyReg, digest, attestations, eligible);
      if (!att.validConfirmers.length) {
        // still journal a rejected verdict path via normal flow with empty confirmers
      }
      const codesAtt = [...att.reasonCodes];
      const quorum = evaluateQuorum(
        att.validConfirmers,
        eligible,
        this.config.quorumRatio,
        this.config.kMin,
      );

      const evidence = await buildEvidence(
        this.nodechain,
        process,
        eligible,
        att.validConfirmers,
        attestations,
        this.config.requiredStages,
      );

      const { criteriaResult, reasonCodes, pass } = evaluateCriteria(evidence);
      const codes = [...reasonCodes, ...codesAtt, ...quorum.reasonCodes];

      const timeout = evaluateTimeout(evidence.openedAtUtc, input.nowMs ?? Date.now(), this.config.timeoutMs);
      codes.push(...timeout.reasonCodes);

      const challenge = await hasOpenChallenge(this.nodechain, process.processId);
      codes.push(...challenge.reasonCodes);

      if (!att.ok) {
        codes.push(PotReason.ATTESTATION_INSUFFICIENT);
      }

      const verified: 0 | 1 =
        pass && quorum.ok && !timeout.expired && !challenge.open && att.validConfirmers.length > 0
          ? 1
          : 0;

      return this.commitVerdict({
        process,
        evidence,
        criteriaResult,
        codes,
        quorum,
        verified,
        expired: timeout.expired,
        challengeBlocked: challenge.open,
        eligible,
        confirmers: att.validConfirmers,
      });
    }

    // Attestations disabled (explicit config only)
    const bareConfirmers: string[] = input.confirmers ?? [];
    const evidence = await buildEvidence(
      this.nodechain,
      process,
      eligible,
      bareConfirmers,
      [],
      this.config.requiredStages,
    );
    const { criteriaResult, reasonCodes, pass } = evaluateCriteria(evidence);
    const codes = [...reasonCodes];
    const timeout = evaluateTimeout(evidence.openedAtUtc, input.nowMs ?? Date.now(), this.config.timeoutMs);
    codes.push(...timeout.reasonCodes);
    const quorum = evaluateQuorum(
      bareConfirmers,
      eligible,
      this.config.quorumRatio,
      this.config.kMin,
    );
    codes.push(...quorum.reasonCodes);
    const challenge = await hasOpenChallenge(this.nodechain, process.processId);
    codes.push(...challenge.reasonCodes);
    const verified: 0 | 1 =
      pass && quorum.ok && !timeout.expired && !challenge.open ? 1 : 0;

    return this.commitVerdict({
      process,
      evidence,
      criteriaResult,
      codes,
      quorum,
      verified,
      expired: timeout.expired,
      challengeBlocked: challenge.open,
      eligible,
      confirmers: bareConfirmers,
    });
  }

  private async commitVerdict(args: {
    process: ProcessState;
    evidence: Awaited<ReturnType<typeof buildEvidence>>;
    criteriaResult: ReturnType<typeof evaluateCriteria>['criteriaResult'];
    codes: string[];
    quorum: ReturnType<typeof evaluateQuorum>;
    verified: 0 | 1;
    expired: boolean;
    challengeBlocked: boolean;
    eligible: string[];
    confirmers: string[];
  }): Promise<PotVerdict> {
    const final = args.verified === 1;

    const evidenceWrite = await this.nodechain.append({
      clientRecordId: `pot-evidence:${args.process.processId}`,
      recordType: 'pot_evidence',
      processId: args.process.processId,
      payload: {
        ...args.evidence,
        criteriaResult: args.criteriaResult,
        reasonCodes: args.codes,
        quorum: args.quorum,
      },
      writerId: 'pot',
      writerRole: 'pot',
    });

    const verdictWrite = await this.nodechain.append({
      clientRecordId: `pot-verdict:${args.process.processId}`,
      recordType: 'pot_verdict',
      processId: args.process.processId,
      payload: {
        schemaVersion: POT_VERDICT_SCHEMA,
        verified: args.verified,
        reasonCodes: args.codes,
        criteriaResult: args.criteriaResult,
        quorum: args.quorum,
        evidenceRecordId: evidenceWrite.recordId,
        evidenceHeight: evidenceWrite.height,
        validatorIds: args.eligible,
        confirmers: args.confirmers,
        attestationDigest: args.evidence.attestationDigest,
        tipHeight: args.evidence.tipHeight,
        tipHash: args.evidence.tipHash,
        final,
        expired: args.expired,
        challengeBlocked: args.challengeBlocked,
      },
      writerId: 'pot',
      writerRole: 'pot',
    });

    return {
      processId: args.process.processId,
      schemaVersion: POT_VERDICT_SCHEMA,
      verified: args.verified,
      reasonCodes: args.codes,
      criteriaResult: args.criteriaResult,
      quorum: args.quorum,
      evidenceRecordId: evidenceWrite.recordId,
      evidenceHeight: evidenceWrite.height,
      verdictRecordId: verdictWrite.recordId,
      ledgerHeight: verdictWrite.height,
      validatorIds: args.eligible,
      confirmers: args.confirmers,
      attestationDigest: args.evidence.attestationDigest,
      tipHeight: args.evidence.tipHeight,
      tipHash: args.evidence.tipHash,
      final,
      expired: args.expired,
      challengeBlocked: args.challengeBlocked,
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
      attestationDigest: String(p.attestationDigest ?? ''),
      tipHeight: Number(p.tipHeight ?? -1),
      tipHash: String(p.tipHash ?? ''),
      final: p.final === true,
      expired: p.expired === true,
      challengeBlocked: p.challengeBlocked === true,
    };
  }
}

function unique(xs: string[]): string[] {
  return [...new Set(xs)];
}
