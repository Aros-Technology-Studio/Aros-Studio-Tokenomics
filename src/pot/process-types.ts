/**
 * Process-type rules for PoT P2 required stages and P4 expectations.
 */

export interface ProcessTypeRule {
  processType: string;
  requiredStages: string[];
  requireDocuments: boolean;
  requireQualifiedSignature: boolean;
  requireValuation: boolean;
  requireHolder: boolean;
}

const RULES: Record<string, ProcessTypeRule> = {
  primary_tokenization: {
    processType: 'primary_tokenization',
    requiredStages: ['opened', 'documents', 'encoded'],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: true,
    requireHolder: true,
  },
  revaluation: {
    processType: 'revaluation',
    requiredStages: ['opened', 'documents', 'encoded'],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: true,
    requireHolder: false,
  },
  ownership_transfer: {
    processType: 'ownership_transfer',
    requiredStages: ['opened', 'documents', 'encoded'],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: false,
    requireHolder: true,
  },
  partial_release: {
    processType: 'partial_release',
    requiredStages: ['opened', 'documents', 'encoded'],
    requireDocuments: true,
    requireQualifiedSignature: true,
    requireValuation: true,
    requireHolder: true,
  },
};

export function getProcessTypeRule(processType: string): ProcessTypeRule {
  const rule = RULES[processType];
  if (!rule) {
    // Unknown types still require core stages — fail-closed toward stricter rules
    return {
      processType,
      requiredStages: ['opened', 'documents', 'encoded'],
      requireDocuments: true,
      requireQualifiedSignature: true,
      requireValuation: true,
      requireHolder: true,
    };
  }
  return rule;
}

export function listProcessTypes(): string[] {
  return Object.keys(RULES);
}
