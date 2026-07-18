import { evaluateQuorum } from './quorum';
import { PotReason } from './reason-codes';

describe('evaluateQuorum', () => {
  it('accepts 2 of 3', () => {
    const r = evaluateQuorum(['v1', 'v2'], ['v1', 'v2', 'v3']);
    expect(r.ok).toBe(true);
    expect(r.K).toBe(3);
    expect(r.Q).toBe(2);
    expect(r.confirmerCount).toBe(2);
  });

  it('rejects 1 of 3', () => {
    const r = evaluateQuorum(['v1'], ['v1', 'v2', 'v3']);
    expect(r.ok).toBe(false);
    expect(r.reasonCodes).toContain(PotReason.QUORUM_SHORT);
  });

  it('rejects K < 3', () => {
    const r = evaluateQuorum(['v1', 'v2'], ['v1', 'v2']);
    expect(r.ok).toBe(false);
    expect(r.reasonCodes).toContain(PotReason.QUORUM_K_BELOW_MIN);
  });

  it('ignores unknown confirmers for count', () => {
    const r = evaluateQuorum(['v1', 'v2', 'evil'], ['v1', 'v2', 'v3']);
    expect(r.confirmerCount).toBe(2);
    expect(r.ok).toBe(true);
  });
});
