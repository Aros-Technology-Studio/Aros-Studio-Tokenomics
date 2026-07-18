import type { JournalRecord } from '../nodechain/types';
import type { ProcessState } from '../processing/process.service';
import type { NodechainService } from '../nodechain/nodechain.service';
import { getProcessTypeRule } from './process-types';
import { attestationDigest, type ConfirmerAttestation } from './attestation';
import { POT_EVIDENCE_SCHEMA, type PotEvidencePackage } from './types';

export async function buildEvidence(
  nodechain: NodechainService,
  process: ProcessState,
  eligibleValidatorIds: string[],
  validConfirmers: string[],
  attestations: ConfirmerAttestation[],
  requiredStagesOverride?: string[],
): Promise<PotEvidencePackage> {
  const history = await nodechain.listByProcessId(process.processId);
  const tip = await nodechain.getTip();
  if (!tip) {
    throw new Error('journal has no tip — genesis required before PoT');
  }

  const open = history.find((r) => r.recordType === 'process_open');
  const openPayload = (open?.payload ?? {}) as Record<string, unknown>;
  const rule = getProcessTypeRule(process.processType);
  const requiredStages = requiredStagesOverride?.length
    ? requiredStagesOverride
    : rule.requiredStages;

  const stagesFromJournal = history
    .filter((r) => r.recordType === 'process_stage' || r.recordType === 'process_open')
    .flatMap((r) => {
      if (r.recordType === 'process_open') return ['opened'] as string[];
      const stage = r.payload?.stage;
      return typeof stage === 'string' ? [stage] : [];
    });

  // documents stage only if flags on process_open say so — not automatic
  const stagesCompleted = unique([
    ...process.stagesCompleted,
    ...stagesFromJournal,
    ...(openPayload.hasDocuments === true ? ['documents'] : []),
    ...(openPayload.payloadHash || process.payloadHash ? ['encoded'] : []),
  ]);

  const baseForDigest = {
    processId: process.processId,
    processType: process.processType,
    tipHash: tip.tipHash,
    tipHeight: tip.height,
    stagesCompleted,
    institutionAllowlisted: openPayload.institutionAllowlisted === true,
    hasDocuments: openPayload.hasDocuments === true,
    hasQualifiedSignature: openPayload.hasQualifiedSignature === true,
  };

  const digest = attestationDigest(baseForDigest);

  return {
    processId: process.processId,
    processType: process.processType,
    schemaVersion: POT_EVIDENCE_SCHEMA,
    institutionAllowlisted: baseForDigest.institutionAllowlisted,
    hasDocuments: baseForDigest.hasDocuments,
    hasQualifiedSignature: baseForDigest.hasQualifiedSignature,
    stagesCompleted,
    requiredStages,
    journalHeights: history.map((r: JournalRecord) => r.height),
    processOpenHeight: open?.height ?? null,
    tipHeight: tip.height,
    tipHash: tip.tipHash,
    validatorIds: [...eligibleValidatorIds],
    confirmers: [...validConfirmers],
    attestationDigest: digest,
    attestations: [...attestations],
    openedAtUtc: open?.timestampUtc ?? null,
    evaluatedAtUtc: new Date().toISOString(),
    valuationPresent: !!(process.valuation && String(process.valuation).length > 0),
    holderPresent: !!(process.holderId && String(process.holderId).length > 0),
  };
}

function unique(xs: string[]): string[] {
  return [...new Set(xs)];
}
