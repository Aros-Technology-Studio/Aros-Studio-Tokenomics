import { quorumMet, requiredQuorum } from './quorum';

describe('quorum', () => {
  it('requires ceil(2/3 * N)', () => {
    expect(requiredQuorum(3)).toBe(2);
    expect(requiredQuorum(1)).toBe(1);
    expect(requiredQuorum(2)).toBe(2);
  });

  it('accepts M-of-N confirming subset', () => {
    expect(quorumMet(['a', 'b', 'c'], ['a', 'b'])).toBe(true);
    expect(quorumMet(['a', 'b', 'c'], ['a'])).toBe(false);
  });
});
