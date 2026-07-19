import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from './auth.service';

describe('AuthService (institutional login)', () => {
  it('logs in DEMO and resolves session', () => {
    const auth = new AuthService();
    const r = auth.login('DEMO', 'demo-institution-token');
    assert.equal(r.ok, true);
    if (!r.ok) return;
    const s = auth.resolve(r.session.sessionId);
    assert.ok(s);
    assert.equal(s!.institutionId, 'DEMO');
  });

  it('rejects bad credentials', () => {
    const auth = new AuthService();
    const r = auth.login('DEMO', 'wrong');
    assert.equal(r.ok, false);
  });

  it('logout invalidates session', () => {
    const auth = new AuthService();
    const r = auth.login('DEMO', 'demo-institution-token');
    assert.equal(r.ok, true);
    if (!r.ok) return;
    auth.logout(r.session.sessionId);
    assert.equal(auth.resolve(r.session.sessionId), null);
  });
});
