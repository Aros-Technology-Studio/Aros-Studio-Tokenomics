import type { JournalRecord } from '../nodechain/types';
import type { ProcessState } from '../processing/process.service';
import type { NodechainService } from '../nodechain/nodechain.service';
import {
  DEFAULT_REQUIRED_STAGES,
  POT_EVIDENCE_SCHEMA,
  type PotEvidencePackage,
} from './types';

export async function buildEvidence(
  nodechain: NodechainService,
  process: ProcessState,
  confirmers: string[],
  validatorIds: string[],
  requiredStages: string[] = [...DEFAULT_REQUIRED_STAGES],
): Promise<PotEvidencePackage> {
  const history = await nodechain.listByProcessId(process.processId);
  const tip = await nodechain.getTip();
  const open = history.find((r) => r.recordType === 'process_open');
  const openPayload = (open?.payload ?? {}) as Record<string, unknown>;

  const stagesFromJournal = history
    .filter((r) => r.recordType === 'process_stage' || r.recordType === 'process_open')
    .flatMap((r) => {
      if (r.recordType === 'process_open') return ['opened'] as string[];
      const stage = r.payload?.stage;
      return typeof stage === 'string' ? [stage] : [];
    });

  const stagesCompleted = unique([
    ...process.stagesCompleted,
    ...stagesFromJournal,
    // process open implies documents captured at open in our model
    ...(open ? ['documents'] : []),
  ]);

  return {
    processId: process.processId,
    processType: process.processType,
    schemaVersion: POT_EVIDENCE_SCHEMA,
    institutionAllowlisted: openPayload.institutionAllowlisted === true,
    hasDocuments: openPayload.hasDocuments === true,
    hasQualifiedSignature: openPayload.hasQualifiedSignature === true,
    stagesCompleted,
    requiredStages,
    journalHeights: history.map((r: JournalRecord) => r.height),
    processOpenHeight: open?.height ?? null,
    tipHeight: tip?.height ?? -1,
    tipHash: tip?.tipHash ?? '',
    validatorIds: [...validatorIds],
    confirmers: [...confirmers],
    openedAtUtc: open?.timestampUtc ?? null,
    evaluatedAtUtc: new Date().toISOString(),
    valuationPresent: !!(process.valuation && String(process.valuation).length > 0),
    holderPresent: !!(process.holderId && String(process.holderId).length > 0),
  };
}

function unique(xs: string[]): string[] {
  return [...new Set(xs)];
}
