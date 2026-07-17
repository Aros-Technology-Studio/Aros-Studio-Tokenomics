import { formatAro, parseAro, split70_30, mulRate } from './money';

describe('money', () => {
  it('parses and formats 9 decimals', () => {
    expect(formatAro(parseAro('100.000000000'))).toBe('100.000000000');
  });

  it('splits 70/30 exactly on residual', () => {
    const { nodes, ast } = split70_30('1.000000000');
    expect(nodes).toBe('0.700000000');
    expect(ast).toBe('0.300000000');
  });

  it('applies fee rate', () => {
    expect(mulRate('1000.000000000', 0.0015)).toBe('1.500000000');
  });
});
