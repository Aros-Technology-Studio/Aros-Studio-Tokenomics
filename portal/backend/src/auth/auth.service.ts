import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export interface InstitutionAccount {
  institutionId: string;
  displayName: string;
  /** Shared secret (dev). Prod: mTLS / OIDC. */
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
    const acc = this.accounts.get(institutionId.trim().toUpperCase());
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
}

function tokensEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function loadAccounts(): InstitutionAccount[] {
  const json = process.env.AST_INSTITUTION_SECRETS_JSON;
  if (json) {
    try {
      return JSON.parse(json) as InstitutionAccount[];
    } catch {
      /* fallthrough */
    }
  }
  return [
    {
      institutionId: 'DEMO',
      displayName: 'Demo Institution',
      token: process.env.AST_INSTITUTION_TOKEN ?? 'demo-institution-token',
      allowlisted: true,
    },
    {
      institutionId: 'ACME',
      displayName: 'ACME Capital Markets',
      token: 'acme-institution-token',
      allowlisted: true,
    },
  ];
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
