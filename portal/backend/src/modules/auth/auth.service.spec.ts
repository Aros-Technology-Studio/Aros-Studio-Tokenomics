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

  it('quick pilot login/salt pilot (case-insensitive login)', () => {
    delete process.env.AST_INSTITUTION_SECRETS_JSON;
    delete process.env.AST_INSTITUTION_SECRETS_FILE;
    process.env.AST_ALLOW_DEMO = '1';
    process.env.NODE_ENV = 'test';
    const auth = new AuthService();
    const r = auth.login('pilot', 'pilot');
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.session.institutionId, 'PILOT');
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

  it('loads institutions from AST_INSTITUTION_SECRETS_FILE', () => {
    const fs = require('fs') as typeof import('fs');
    const os = require('os') as typeof import('os');
    const path = require('path') as typeof import('path');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-sec-'));
    const file = path.join(dir, 'secrets.json');
    fs.writeFileSync(
      file,
      JSON.stringify([
        {
          institutionId: 'FILECO',
          displayName: 'From File',
          token: 'file-secret-token-yy',
          allowlisted: true,
        },
      ]),
    );
    process.env.NODE_ENV = 'production';
    process.env.AST_ALLOW_DEMO = '0';
    delete process.env.AST_INSTITUTION_SECRETS_JSON;
    process.env.AST_INSTITUTION_SECRETS_FILE = file;
    const auth = new AuthService();
    const r = auth.login('FILECO', 'file-secret-token-yy');
    assert.equal(r.ok, true);
    delete process.env.AST_INSTITUTION_SECRETS_FILE;
    process.env.NODE_ENV = 'test';
    process.env.AST_ALLOW_DEMO = '1';
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('D6 mTLS map login and password disabled when required', () => {
    process.env.AST_ALLOW_DEMO = '1';
    process.env.AST_MTLS_TRUST_PROXY = '1';
    process.env.AST_MTLS_MAP_JSON = JSON.stringify([
      { subjectContains: 'CN=PILOT', institutionId: 'PILOT', displayName: 'Pilot Institution' },
    ]);
    process.env.AST_REQUIRE_MTLS = '1';
    delete process.env.AST_INSTITUTION_SECRETS_JSON;
    delete process.env.AST_INSTITUTION_SECRETS_FILE;
    const auth = new AuthService();
    const blocked = auth.login('pilot', 'pilot');
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.equal(blocked.code, 'AUTH_PASSWORD_DISABLED');
    const r = auth.loginMtls({ 'x-ssl-client-s-dn': 'CN=PILOT,O=Bank' });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.session.institutionId, 'PILOT');
    delete process.env.AST_REQUIRE_MTLS;
    delete process.env.AST_MTLS_TRUST_PROXY;
    delete process.env.AST_MTLS_MAP_JSON;
  });

  it('D6 OIDC HS256 pilot login', () => {
    const { signOidcHs256 } = require('./mtls-oidc') as typeof import('./mtls-oidc');
    process.env.AST_ALLOW_DEMO = '1';
    process.env.AST_OIDC_HS_SECRET = 'test-oidc-secret-d6';
    process.env.AST_OIDC_ISSUER = 'https://idp.example/ast';
    process.env.AST_OIDC_AUDIENCE = 'ast-portal';
    delete process.env.AST_REQUIRE_OIDC;
    delete process.env.AST_REQUIRE_MTLS;
    delete process.env.AST_INSTITUTION_SECRETS_JSON;
    delete process.env.AST_INSTITUTION_SECRETS_FILE;
    const auth = new AuthService();
    const jwt = signOidcHs256(
      {
        sub: 'DEMO',
        institution_id: 'DEMO',
        iss: 'https://idp.example/ast',
        aud: 'ast-portal',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      'test-oidc-secret-d6',
    );
    const r = auth.loginOidc(`Bearer ${jwt}`);
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.session.institutionId, 'DEMO');
    delete process.env.AST_OIDC_HS_SECRET;
    delete process.env.AST_OIDC_ISSUER;
    delete process.env.AST_OIDC_AUDIENCE;
  });
});
