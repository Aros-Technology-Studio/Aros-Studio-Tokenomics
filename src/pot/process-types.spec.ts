import {
  getProcessTypeRule,
  listProcessTypes,
  listProcessTypeRules,
  requiredStagesFor,
  STAGE_CATALOG,
} from './process-types';

describe('PoT process-type stage catalog', () => {
  it('lists primary types', () => {
    expect(listProcessTypes()).toEqual(
      expect.arrayContaining([
        'primary_tokenization',
        'revaluation',
        'ownership_transfer',
        'partial_release',
      ]),
    );
    expect(listProcessTypeRules().length).toBe(listProcessTypes().length);
  });

  it('requires core stages for primary tokenization', () => {
    const rule = getProcessTypeRule('primary_tokenization');
    expect(rule.requiredStages).toEqual(['opened', 'documents', 'encoded']);
    expect(rule.requireValuation).toBe(true);
    expect(rule.requireHolder).toBe(true);
  });

  it('ownership_transfer does not require valuation', () => {
    const rule = getProcessTypeRule('ownership_transfer');
    expect(rule.requireValuation).toBe(false);
    expect(rule.requireHolder).toBe(true);
  });

  it('unknown types get strict defaults', () => {
    const rule = getProcessTypeRule('custom_future_type');
    expect(rule.requiredStages).toContain('encoded');
    expect(rule.requireDocuments).toBe(true);
  });

  it('requiredStagesFor honors override', () => {
    expect(requiredStagesFor('primary_tokenization', ['opened'])).toEqual(['opened']);
    expect(STAGE_CATALOG).toContain('awaiting_pot');
  });
});
