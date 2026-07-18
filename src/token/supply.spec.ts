import { computeRevaluationSupply, proRataAllocate } from './supply';
import { parseAro } from '../common/money';

describe('token supply math', () => {
  it('doubles supply when value doubles', () => {
    const r = computeRevaluationSupply('100.000000000', '100.000000000', '200.000000000');
    expect(r.direction).toBe('mint');
    expect(r.supplyAfter).toBe('200.000000000');
    expect(r.deltaSupply).toBe('100.000000000');
  });

  it('halves supply when value halves', () => {
    const r = computeRevaluationSupply('100.000000000', '100.000000000', '50.000000000');
    expect(r.direction).toBe('burn');
    expect(r.supplyAfter).toBe('50.000000000');
  });

  it('pro-rata allocates residual to last holder', () => {
    const bal = new Map<string, bigint>([
      ['a', parseAro('30.000000000')],
      ['b', parseAro('70.000000000')],
    ]);
    const parts = proRataAllocate(bal, parseAro('10.000000000'));
    const sum = parts.reduce((s, p) => s + p.delta, 0n);
    expect(sum).toBe(parseAro('10.000000000'));
  });
});
