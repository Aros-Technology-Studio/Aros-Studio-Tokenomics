import { floorToArx, isAtLeastDust, minDustAro, parseDecimal } from './money';

describe('money', () => {
  it('floors to 9 decimal places (arx)', () => {
    expect(floorToArx('1.1234567899').toFixed(9)).toBe('1.123456789');
  });

  it('defines dust as 1 arx', () => {
    expect(minDustAro().toFixed(9)).toBe('0.000000001');
    expect(isAtLeastDust('0.000000001')).toBe(true);
    expect(isAtLeastDust('0.0000000009')).toBe(false);
  });

  it('rejects non-finite decimals', () => {
    expect(() => parseDecimal('not-a-number')).toThrow('INVALID_DECIMAL');
  });
});
