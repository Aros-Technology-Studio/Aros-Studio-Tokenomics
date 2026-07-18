import {
  formatAro,
  parseAro,
  split70_30,
  mulRate,
  addAro,
  subAro,
  cmpAro,
  isPositiveAro,
  isBelowDust,
  ARO_DUST,
} from './money';
import { isValidProcessId, makeProcessId, assertValidProcessId } from './process-id';

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

  it('adds and subtracts', () => {
    expect(addAro('1.5', '2.5')).toBe('4.000000000');
    expect(subAro('10', '3.1')).toBe('6.900000000');
  });

  it('compares and dust', () => {
    expect(cmpAro('1', '2')).toBe(-1);
    expect(isPositiveAro('0.000000001')).toBe(true);
    expect(isBelowDust(ARO_DUST)).toBe(false);
    expect(isBelowDust('0.000000000')).toBe(false);
  });

  it('rejects scientific notation', () => {
    expect(() => parseAro('1e9')).toThrow(/invalid amount/);
  });
});

describe('processId', () => {
  it('generates valid AST process ids', () => {
    const id = makeProcessId('Demo Bank');
    expect(isValidProcessId(id)).toBe(true);
    expect(id.startsWith('AST-DEMOBANK-')).toBe(true);
    expect(() => assertValidProcessId(id)).not.toThrow();
  });

  it('rejects malformed ids', () => {
    expect(isValidProcessId('AST-BAD')).toBe(false);
    expect(() => assertValidProcessId('AST-BAD')).toThrow(/invalid processId/);
  });
});
