import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from './auth.service';

describe('AuthService (institutional login)', () => {
  const prev = {
    NODE_ENV: process.env.NODE_ENV,
    AST_ALLOW_DEMO: process.env.AST_ALLOW_DEMO,
    AST_INSTITUTION_SECRETS_JSON: process.env.AST_INSTITUTION_SECRETS_JSON,
  };

  before(() => {
    process.env.NODE_ENV = 'test';
    process.env.AST_ALLOW_DEMO = '1';
    delete process.env.AST_INSTITUTION_SECRETS_JSON;
  });

  after(() => {
    if (prev.NODE_ENV === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prev.NODE_ENV;
    if (prev.AST_ALLOW_DEMO === undefined) delete process.env.AST_ALLOW_DEMO;
    else process.env.AST_ALLOW_DEMO = prev.AST_ALLOW_DEMO;
    if (prev.AST_INSTITUTION_SECRETS_JSON === undefined) {
      delete process.env.AST_INSTITUTION_SECRETS_JSON;
    } else {
      process.env.AST_INSTITUTION_SECRETS_JSON = prev.AST_INSTITUTION_SECRETS_JSON;
    }
  });

  it('logs in DEMO when demo allowlisted', () => {
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

  it('production without secrets has no demo accounts', () => {
    process.env.NODE_ENV = 'production';
    process.env.AST_ALLOW_DEMO = '0';
    delete process.env.AST_INSTITUTION_SECRETS_JSON;
    const auth = new AuthService();
    assert.equal(auth.configuredCount(), 0);
    const r = auth.login('DEMO', 'demo-institution-token');
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, 'AUTH_NOT_CONFIGURED');
    // restore for other tests if any run after
    process.env.NODE_ENV = 'test';
    process.env.AST_ALLOW_DEMO = '1';
  });

  it('loads institutions from AST_INSTITUTION_SECRETS_JSON', () => {
    process.env.NODE_ENV = 'production';
    process.env.AST_ALLOW_DEMO = '0';
    process.env.AST_INSTITUTION_SECRETS_JSON = JSON.stringify([
      {
        institutionId: 'BANKX',
        displayName: 'Bank X',
        token: 'real-secret-token-xx',
        allowlisted: true,
      },
    ]);
    const auth = new AuthService();
    const r = auth.login('BANKX', 'real-secret-token-xx');
    assert.equal(r.ok, true);
    process.env.NODE_ENV = 'test';
    process.env.AST_ALLOW_DEMO = '1';
    delete process.env.AST_INSTITUTION_SECRETS_JSON;
  });
});
