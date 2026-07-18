/**
 * Process-type stage catalog for PoT P2/P4.
 * Required stages are fail-closed when missing from process.stagesCompleted / journal.
 */

export interface ProcessTypeRule {
  processType: string;
  /** Stages that must appear in stagesCompleted for P2. */
  requiredStages: string[];
  requireDocuments: boolean;
  requireQualifiedSignature: boolean;
  requireValuation: boolean;
  requireHolder: boolean;
  description: string;
}

/** Shared stage names used across process types (processing layer). */
export const STAGE_CATALOG = [
  'opened',
  'documents',
  'encoded',
  'awaiting_pot',
  'pot_done',
  'settled',
  'closed',
  'aborted',
] as const;

export type StageName = (typeof STAGE_CATALOG)[number];

const CORE_STAGES = ['opened', 'documents', 'encoded'] as const;

const RULES: Record<string, ProcessTypeRule> = {
  primary_tokenization: {
    processType: 'primary_tokenization',
    requiredStages: [...CORE_STAGES],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: true,
    requireHolder: true,
    description: 'Primary mint at institutional valuation',
  },
  revaluation: {
    processType: 'revaluation',
    requiredStages: [...CORE_STAGES],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: true,
    requireHolder: false,
    description: 'ΔValue pro-rata supply change',
  },
  ownership_transfer: {
    processType: 'ownership_transfer',
    requiredStages: [...CORE_STAGES],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: false,
    requireHolder: true,
    description: 'Internal holder transfer after PoT',
  },
  partial_release: {
    processType: 'partial_release',
    requiredStages: [...CORE_STAGES],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: true,
    requireHolder: true,
    description: 'Burn + reserve child + remint remainder',
  },
};

export function getProcessTypeRule(processType: string): ProcessTypeRule {
  const rule = RULES[processType];
  if (!rule) {
    // Unknown types still require core stages — fail-closed toward stricter rules
    return {
      processType,
      requiredStages: [...CORE_STAGES],
      requireDocuments: true,
      requireQualifiedSignature: true,
      requireValuation: true,
      requireHolder: true,
      description: 'Unknown process type (strict default)',
    };
  }
  return rule;
}

export function listProcessTypes(): string[] {
  return Object.keys(RULES).sort();
}

export function listProcessTypeRules(): ProcessTypeRule[] {
  return listProcessTypes().map((t) => RULES[t]);
}

export function requiredStagesFor(
  processType: string,
  override?: string[],
): string[] {
  if (override?.length) return [...override];
  return [...getProcessTypeRule(processType).requiredStages];
}
