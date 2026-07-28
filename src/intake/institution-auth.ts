import { createHmac, timingSafeEqual } from 'crypto';
import * as fs from 'fs';

/**
 * Institution edge authentication (phase C).
 * Headers: X-Institution-Id + X-Institution-Token (HMAC or shared secret).
 * Production: replace secrets map with mTLS cert map / OIDC.
 *
 * Loads: constructor seed → AST_INSTITUTION_SECRETS_JSON → AST_INSTITUTION_SECRETS_FILE
 * → built-in PILOT/pilot + DEMO (dev).
 */
export interface InstitutionCredential {
  institutionId: string;
  /** Shared secret or API token (UI: salt) */
  token: string;
  allowlisted: boolean;
}

export class InstitutionAuthService {
  private readonly secrets = new Map<string, InstitutionCredential>();

  constructor(seed?: InstitutionCredential[]) {
    for (const c of seed ?? loadInstitutionCredentials()) {
      this.secrets.set(c.institutionId.toUpperCase(), {
        ...c,
        institutionId: c.institutionId.toUpperCase(),
      });
    }
  }

  register(cred: InstitutionCredential): void {
    this.secrets.set(cred.institutionId.toUpperCase(), {
      ...cred,
      institutionId: cred.institutionId.toUpperCase(),
    });
  }

  /**
   * Validate institution identity. Fail-closed.
   */
  authenticate(
    institutionId: string | undefined,
    token: string | undefined,
  ): { ok: true; institutionId: string; allowlisted: boolean } | { ok: false; code: string; message: string } {
    if (!institutionId?.trim()) {
      return { ok: false, code: 'AUTH_INSTITUTION_REQUIRED', message: 'X-Institution-Id required' };
    }
    if (!token?.trim()) {
      return { ok: false, code: 'AUTH_TOKEN_REQUIRED', message: 'X-Institution-Token required' };
    }
    const row = this.secrets.get(institutionId.trim().toUpperCase());
    if (!row) {
      return { ok: false, code: 'AUTH_UNKNOWN_INSTITUTION', message: 'unknown institution' };
    }
    if (!tokensEqual(row.token, token.trim())) {
      return { ok: false, code: 'AUTH_INVALID_TOKEN', message: 'invalid institution token' };
    }
    if (!row.allowlisted) {
      return { ok: false, code: 'AUTH_NOT_ALLOWLISTED', message: 'institution not allowlisted' };
    }
    return { ok: true, institutionId: row.institutionId, allowlisted: true };
  }
}

function tokensEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function loadInstitutionCredentials(): InstitutionCredential[] {
  const fromJson = parseCredentialsJson(process.env.AST_INSTITUTION_SECRETS_JSON);
  if (fromJson.length > 0) return fromJson;

  const filePath = process.env.AST_INSTITUTION_SECRETS_FILE?.trim();
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const fromFile = parseCredentialsJson(raw);
        if (fromFile.length > 0) return fromFile;
      }
    } catch {
      /* fall through */
    }
  }

  // Dev defaults — quick pilot entry matches portal login/salt
  return [
    { institutionId: 'PILOT', token: process.env.AST_PILOT_SALT ?? 'pilot', allowlisted: true },
    { institutionId: 'DEMO', token: 'demo-institution-token', allowlisted: true },
  ];
}

function parseCredentialsJson(json: string | undefined | null): InstitutionCredential[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as InstitutionCredential[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed
      .map((a) => ({
        institutionId: String(a.institutionId ?? '').toUpperCase(),
        token: String(a.token ?? ''),
        allowlisted: a.allowlisted !== false,
      }))
      .filter((a) => a.institutionId && a.token);
  } catch {
    return [];
  }
}

/** Optional request signing: HMAC-SHA256(token, method\\npath\\nbodyHash). */
export function verifyRequestHmac(input: {
  token: string;
  method: string;
  path: string;
  bodyHash: string;
  signatureHex: string;
}): boolean {
  const mac = createHmac('sha256', input.token)
    .update(`${input.method.toUpperCase()}\n${input.path}\n${input.bodyHash}`)
    .digest('hex');
  try {
    return timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(input.signatureHex, 'hex'));
  } catch {
    return false;
  }
}
