import type { CriteriaResult, PotEvidencePackage } from './types';
import { PotReason, stageMissing, type PotReasonCode } from './reason-codes';

/**
 * Pure P1–P4 evaluation. No I/O. No amount math.
 */
export function evaluateCriteria(ev: PotEvidencePackage): {
  criteriaResult: CriteriaResult;
  reasonCodes: PotReasonCode[];
  pass: boolean;
} {
  const reasonCodes: PotReasonCode[] = [];

  const P1 = ev.institutionAllowlisted === true;
  if (!P1) reasonCodes.push(PotReason.P1_INSTITUTION_NOT_ALLOWLISTED);

  const missingStages = ev.requiredStages.filter((s) => !ev.stagesCompleted.includes(s));
  const P2 = missingStages.length === 0;
  if (!P2) {
    reasonCodes.push(PotReason.P2_STAGES_INCOMPLETE);
    for (const s of missingStages) reasonCodes.push(stageMissing(s));
  }

  const P3 = ev.processOpenHeight !== null && ev.journalHeights.length > 0;
  if (!P3) {
    reasonCodes.push(PotReason.P3_STATES_NOT_RECORDED);
    if (ev.processOpenHeight === null) reasonCodes.push(PotReason.P3_MISSING_PROCESS_OPEN);
  }

  let P4 = true;
  if (!ev.hasDocuments) {
    P4 = false;
    reasonCodes.push(PotReason.P4_DOCUMENTS_MISSING);
  }
  if (!ev.hasQualifiedSignature) {
    P4 = false;
    reasonCodes.push(PotReason.P4_SIGNATURE_MISSING);
  }
  if (!ev.valuationPresent) {
    P4 = false;
    reasonCodes.push(PotReason.P4_VALUATION_MISSING);
  }
  if (!ev.holderPresent) {
    P4 = false;
    reasonCodes.push(PotReason.P4_HOLDER_MISSING);
  }
  if (!P4 && !reasonCodes.some((c) => String(c).startsWith('P4_'))) {
    reasonCodes.push(PotReason.P4_PROCESS_RULES_FAILED);
  }

  const criteriaResult: CriteriaResult = { P1, P2, P3, P4 };
  const pass = P1 && P2 && P3 && P4;
  return { criteriaResult, reasonCodes, pass };
}
