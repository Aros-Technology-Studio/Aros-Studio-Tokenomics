import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import * as fs from 'fs';

export interface InstitutionAccount {
  institutionId: string;
  displayName: string;
  /** Shared secret (v1). Prod target: mTLS / OIDC + secrets store. */
  token: string;
  allowlisted: boolean;
}

export interface Session {
  sessionId: string;
  institutionId: string;
  displayName: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly accounts = new Map<string, InstitutionAccount>();
  private readonly sessions = new Map<string, Session>();

  constructor() {
    for (const a of loadAccounts()) {
      this.accounts.set(a.institutionId.toUpperCase(), {
        ...a,
        institutionId: a.institutionId.toUpperCase(),
      });
    }
  }

  login(
    institutionId: string | undefined,
    token: string | undefined,
  ):
    | { ok: true; session: Session }
    | { ok: false; code: string; message: string } {
    if (!institutionId?.trim() || !token?.trim()) {
      return {
        ok: false,
        code: 'AUTH_REQUIRED',
        message: 'institutionId and token required',
      };
    }
    if (this.accounts.size === 0) {
      return {
        ok: false,
        code: 'AUTH_NOT_CONFIGURED',
        message:
          'no institutions configured — set AST_INSTITUTION_SECRETS_JSON (production)',
      };
    }
    // login is institution id (case-insensitive); salt is the shared secret (token field)
    const loginKey = institutionId.trim().toUpperCase();
    const acc = this.accounts.get(loginKey);
    if (!acc || !tokensEqual(acc.token, token.trim())) {
      return {
        ok: false,
        code: 'AUTH_INVALID',
        message: 'invalid institution credentials',
      };
    }
    if (!acc.allowlisted) {
      return {
        ok: false,
        code: 'AUTH_NOT_ALLOWLISTED',
        message: 'institution not allowlisted',
      };
    }
    const sessionId = randomBytes(24).toString('hex');
    const now = Date.now();
    const session: Session = {
      sessionId,
      institutionId: acc.institutionId,
      displayName: acc.displayName,
      token: acc.token,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    };
    this.sessions.set(sessionId, session);
    return { ok: true, session };
  }

  logout(sessionId: string | undefined): void {
    if (sessionId) this.sessions.delete(sessionId);
  }

  resolve(sessionId: string | undefined): Session | null {
    if (!sessionId) return null;
    const s = this.sessions.get(sessionId);
    if (!s) return null;
    if (Date.parse(s.expiresAt) < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return s;
  }

  listInstitutionsPublic(): Array<{ institutionId: string; displayName: string }> {
    return [...this.accounts.values()]
      .filter((a) => a.allowlisted)
      .map((a) => ({ institutionId: a.institutionId, displayName: a.displayName }))
      .sort((a, b) => a.institutionId.localeCompare(b.institutionId));
  }

  configuredCount(): number {
    return this.accounts.size;
  }
}

function tokensEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Production: AST_INSTITUTION_SECRETS_JSON and/or AST_INSTITUTION_SECRETS_FILE.
 * Local/dev: AST_ALLOW_DEMO=1 → DEMO/ACME (never default in production).
 *
 * Prefer FILE for real secrets (not shell history). Path example:
 *   data/institution-secrets.json  (gitignored via data/)
 */
export function loadAccounts(): InstitutionAccount[] {
  const fromEnv = parseAccountsJson(process.env.AST_INSTITUTION_SECRETS_JSON);
  if (fromEnv.length > 0) return fromEnv;

  const filePath = process.env.AST_INSTITUTION_SECRETS_FILE?.trim();
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const fromFile = parseAccountsJson(raw);
        if (fromFile.length > 0) return fromFile;
      }
    } catch {
      /* fallthrough */
    }
  }

  if (!allowDemoInstitutions()) {
    return [];
  }

  return [
    {
      /** Quick local entry: login pilot · salt pilot */
      institutionId: 'PILOT',
      displayName: 'Pilot Institution',
      token: process.env.AST_PILOT_SALT ?? 'pilot',
      allowlisted: true,
    },
    {
      institutionId: 'DEMO',
      displayName: 'Demo Institution',
      token: process.env.AST_INSTITUTION_TOKEN ?? 'demo-institution-token',
      allowlisted: true,
    },
    {
      institutionId: 'ACME',
      displayName: 'ACME Capital Markets',
      token: process.env.AST_ACME_TOKEN ?? 'acme-institution-token',
      allowlisted: true,
    },
  ];
}

export function parseAccountsJson(json: string | undefined | null): InstitutionAccount[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as InstitutionAccount[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed
      .map((a) => ({
        institutionId: String(a.institutionId ?? '').toUpperCase(),
        displayName: String(a.displayName ?? a.institutionId ?? 'Institution'),
        token: String(a.token ?? ''),
        allowlisted: a.allowlisted !== false,
      }))
      .filter((a) => a.institutionId && a.token);
  } catch {
    return [];
  }
}

function allowDemoInstitutions(): boolean {
  const flag = process.env.AST_ALLOW_DEMO;
  if (flag === '1' || flag === 'true') return true;
  if (flag === '0' || flag === 'false') return false;
  // Default: demo only outside production
  return (process.env.NODE_ENV ?? 'development') !== 'production';
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
