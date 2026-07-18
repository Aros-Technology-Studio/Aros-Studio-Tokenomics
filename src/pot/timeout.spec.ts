import { evaluateTimeout, isWithinConfirmationWindow, POT_TIMEOUT_MS } from './timeout';
import { PotReason } from './reason-codes';

describe('PoT timeout module', () => {
  it('defaults to 15 minute window', () => {
    expect(POT_TIMEOUT_MS).toBe(15 * 60 * 1000);
  });

  it('not expired inside window', () => {
    const opened = new Date('2026-07-18T12:00:00.000Z').getTime();
    const r = evaluateTimeout(
      '2026-07-18T12:00:00.000Z',
      opened + 60_000,
      POT_TIMEOUT_MS,
    );
    expect(r.expired).toBe(false);
    expect(r.elapsedMs).toBe(60_000);
    expect(isWithinConfirmationWindow('2026-07-18T12:00:00.000Z', opened + 60_000)).toBe(
      true,
    );
  });

  it('expired after timeoutMs', () => {
    const opened = new Date('2026-07-18T12:00:00.000Z').getTime();
    const r = evaluateTimeout('2026-07-18T12:00:00.000Z', opened + 16 * 60 * 1000, 15 * 60 * 1000);
    expect(r.expired).toBe(true);
    expect(r.reasonCodes).toContain(PotReason.POT_TIMEOUT);
  });

  it('invalid openedAt is fail-closed expired', () => {
    const r = evaluateTimeout('not-a-date', Date.now(), 1000);
    expect(r.expired).toBe(true);
  });
});
