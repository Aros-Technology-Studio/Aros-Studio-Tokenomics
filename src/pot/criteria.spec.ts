import { evaluateCriteria } from './criteria';
import { POT_EVIDENCE_SCHEMA, type PotEvidencePackage } from './types';
import { PotReason } from './reason-codes';

function base(over: Partial<PotEvidencePackage> = {}): PotEvidencePackage {
  return {
    processId: 'p',
    processType: 'primary_tokenization',
    schemaVersion: POT_EVIDENCE_SCHEMA,
    institutionAllowlisted: true,
    hasDocuments: true,
    hasQualifiedSignature: true,
    stagesCompleted: ['opened', 'documents', 'encoded'],
    requiredStages: ['opened', 'documents', 'encoded'],
    journalHeights: [1, 2],
    processOpenHeight: 1,
    tipHeight: 2,
    tipHash: 'abc',
    validatorIds: ['v1', 'v2', 'v3'],
    confirmers: ['v1', 'v2'],
    openedAtUtc: new Date().toISOString(),
    evaluatedAtUtc: new Date().toISOString(),
    valuationPresent: true,
    holderPresent: true,
    ...over,
  };
}

describe('evaluateCriteria', () => {
  it('passes when all P1–P4 hold', () => {
    const r = evaluateCriteria(base());
    expect(r.pass).toBe(true);
    expect(r.criteriaResult).toEqual({ P1: true, P2: true, P3: true, P4: true });
    expect(r.reasonCodes).toHaveLength(0);
  });

  it('fails P1', () => {
    const r = evaluateCriteria(base({ institutionAllowlisted: false }));
    expect(r.pass).toBe(false);
    expect(r.criteriaResult.P1).toBe(false);
    expect(r.reasonCodes).toContain(PotReason.P1_INSTITUTION_NOT_ALLOWLISTED);
  });

  it('fails P2 with missing stage codes', () => {
    const r = evaluateCriteria(base({ stagesCompleted: ['opened'] }));
    expect(r.criteriaResult.P2).toBe(false);
    expect(r.reasonCodes).toContain(PotReason.P2_STAGES_INCOMPLETE);
    expect(r.reasonCodes.some((c) => String(c).startsWith('P2_STAGE_MISSING:'))).toBe(true);
  });

  it('fails P3 without process open', () => {
    const r = evaluateCriteria(base({ processOpenHeight: null, journalHeights: [] }));
    expect(r.criteriaResult.P3).toBe(false);
    expect(r.reasonCodes).toContain(PotReason.P3_MISSING_PROCESS_OPEN);
  });

  it('fails P4 docs and signature', () => {
    const r = evaluateCriteria(
      base({ hasDocuments: false, hasQualifiedSignature: false }),
    );
    expect(r.criteriaResult.P4).toBe(false);
    expect(r.reasonCodes).toContain(PotReason.P4_DOCUMENTS_MISSING);
    expect(r.reasonCodes).toContain(PotReason.P4_SIGNATURE_MISSING);
  });
});
