import { NodechainService } from '../nodechain/nodechain.service';
import type { ProcessState } from '../processing/process.service';

export interface PotEvidence {
  processId: string;
  institutionAllowlisted: boolean;
  stagesCompleted: string[];
  requiredStages: string[];
  significantStatesRecorded: boolean;
  processTypeRulesOk: boolean;
  validatorIds: string[];
  /** Each validator id that confirms (simple co-sign set). */
  confirmers: string[];
}

export interface PotVerdict {
  processId: string;
  verified: 0 | 1;
  reasonCodes: string[];
  criteriaResult: Record<string, boolean>;
  ledgerHeight: number;
  recordId: string;
}

/**
 * Layer 04 — PoT P1–P4. No amount math. Writes pot_verdict before emission may run.
 */
export class PotService {
  constructor(private readonly nodechain: NodechainService) {}

  evaluateCriteria(ev: PotEvidence): {
    criteriaResult: Record<string, boolean>;
    reasonCodes: string[];
    pass: boolean;
  } {
    const reasonCodes: string[] = [];
    const P1 = ev.institutionAllowlisted;
    if (!P1) reasonCodes.push('P1_INSTITUTION_NOT_ALLOWLISTED');

    const P2 = ev.requiredStages.every((s) => ev.stagesCompleted.includes(s));
    if (!P2) reasonCodes.push('P2_STAGES_INCOMPLETE');

    const P3 = ev.significantStatesRecorded;
    if (!P3) reasonCodes.push('P3_STATES_NOT_RECORDED');

    const P4 = ev.processTypeRulesOk;
    if (!P4) reasonCodes.push('P4_PROCESS_RULES_FAILED');

    const criteriaResult = { P1, P2, P3, P4 };
    const pass = P1 && P2 && P3 && P4;
    return { criteriaResult, reasonCodes, pass };
  }

  quorumOk(confirmers: string[], validatorIds: string[], ratio = 2 / 3): boolean {
    const K = validatorIds.length;
    if (K < 3) return false;
    const Q = Math.ceil(ratio * K);
    const set = new Set(validatorIds);
    const valid = confirmers.filter((c) => set.has(c));
    return valid.length >= Q;
  }

  async verify(
    process: ProcessState,
    confirmers: string[],
    validatorIds: string[] = ['v1', 'v2', 'v3'],
  ): Promise<PotVerdict> {
    const history = await this.nodechain.listByProcessId(process.processId);
    const significantStatesRecorded = history.some((r) => r.recordType === 'process_open');

    const evidence: PotEvidence = {
      processId: process.processId,
      institutionAllowlisted: true,
      stagesCompleted: process.stagesCompleted,
      requiredStages: ['opened', 'documents', 'encoded'],
      significantStatesRecorded,
      processTypeRulesOk: !!process.valuation && !!process.holderId,
      validatorIds,
      confirmers,
    };

    // re-read allowlist from open payload if present
    const open = history.find((r) => r.recordType === 'process_open');
    if (open?.payload) {
      evidence.institutionAllowlisted = open.payload.institutionAllowlisted === true;
      if (open.payload.hasDocuments !== true || open.payload.hasQualifiedSignature !== true) {
        evidence.processTypeRulesOk = false;
      }
    }

    const { criteriaResult, reasonCodes, pass } = this.evaluateCriteria(evidence);
    const q = this.quorumOk(confirmers, validatorIds);
    if (!q) reasonCodes.push('QUORUM_SHORT');

    const verified: 0 | 1 = pass && q ? 1 : 0;

    await this.nodechain.append({
      clientRecordId: `pot-evidence:${process.processId}`,
      recordType: 'pot_evidence',
      processId: process.processId,
      payload: {
        criteriaResult,
        validatorIds,
        confirmers,
        stagesCompleted: process.stagesCompleted,
      },
      writerId: 'pot',
      writerRole: 'pot',
    });

    const result = await this.nodechain.append({
      clientRecordId: `pot-verdict:${process.processId}`,
      recordType: 'pot_verdict',
      processId: process.processId,
      payload: {
        verified,
        reasonCodes,
        criteriaResult,
        validatorIds,
        confirmers,
      },
      writerId: 'pot',
      writerRole: 'pot',
    });

    return {
      processId: process.processId,
      verified,
      reasonCodes,
      criteriaResult,
      ledgerHeight: result.height,
      recordId: result.recordId,
    };
  }
}
