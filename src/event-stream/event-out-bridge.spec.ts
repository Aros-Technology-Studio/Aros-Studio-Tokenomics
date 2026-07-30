import { eventOutConfigured, fanOutObserverEvent } from './event-out-bridge';
import type { ObserverEvent } from './types';

describe('event-out-bridge (I3)', () => {
  it('detects configuration', () => {
    expect(eventOutConfigured({})).toBe(false);
    expect(eventOutConfigured({ AST_EVENT_OUT_URL: 'http://127.0.0.1:9/x' })).toBe(true);
    expect(eventOutConfigured({ AST_EVENT_OUT_KAFKA_BROKERS: '127.0.0.1:9092' })).toBe(true);
  });

  it('HTTP fan-out reports status without throwing', async () => {
    const ev = {
      seq: 1,
      type: 'record_appended',
      at: new Date().toISOString(),
    } as ObserverEvent;
    // Unreachable port — must not throw
    const r = await fanOutObserverEvent(ev, {
      AST_EVENT_OUT_URL: 'http://127.0.0.1:1/nope',
    });
    expect(r.http?.ok).toBe(false);
  });
});
