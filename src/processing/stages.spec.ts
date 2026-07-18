import {
  allowedNext,
  assertTransition,
  canTransition,
  isProcessStage,
  isTerminal,
  listFsmEdges,
  STAGE_ORDER,
} from './stages';
import { ProcessError, ProcessErrorCode } from './errors';

describe('Processing FSM (stages)', () => {
  it('happy-path edges', () => {
    expect(canTransition('awaiting_pot', 'pot_done')).toBe(true);
    expect(canTransition('pot_done', 'settled')).toBe(true);
    expect(canTransition('settled', 'closed')).toBe(true);
    expect(canTransition('pot_done', 'closed')).toBe(true);
  });

  it('abort edges from non-terminal', () => {
    expect(canTransition('awaiting_pot', 'aborted')).toBe(true);
    expect(canTransition('pot_done', 'aborted')).toBe(true);
    expect(canTransition('settled', 'aborted')).toBe(true);
    expect(canTransition('closed', 'aborted')).toBe(false);
  });

  it('forbids skip settle→awaiting_pot', () => {
    expect(canTransition('awaiting_pot', 'settled')).toBe(false);
    expect(canTransition('awaiting_pot', 'closed')).toBe(false);
  });

  it('assertTransition fail-closed', () => {
    expect(() => assertTransition('awaiting_pot', 'closed', 'p1')).toThrow(ProcessError);
    try {
      assertTransition('closed', 'aborted', 'p1');
    } catch (e) {
      expect(e).toMatchObject({ code: ProcessErrorCode.TERMINAL });
    }
  });

  it('lists edges and stage order', () => {
    const edges = listFsmEdges();
    expect(edges.length).toBeGreaterThan(5);
    expect(STAGE_ORDER).toContain('settled');
    expect(isProcessStage('pot_done')).toBe(true);
    expect(isProcessStage('mint')).toBe(false);
    expect(isTerminal('aborted')).toBe(true);
    expect(allowedNext('settled')).toEqual(expect.arrayContaining(['closed', 'aborted']));
  });
});
