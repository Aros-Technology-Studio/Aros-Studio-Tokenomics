import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Institution edge authentication (phase C).
 * Headers: X-Institution-Id + X-Institution-Token (HMAC or shared secret).
 * Production: replace secrets map with mTLS cert map / OIDC.
 */
export interface InstitutionCredential {
  institutionId: string;
  /** Shared secret or API token */
  token: string;
  allowlisted: boolean;
}

export class InstitutionAuthService {
  private readonly secrets = new Map<string, InstitutionCredential>();

  constructor(seed?: InstitutionCredential[]) {
    for (const c of seed ?? defaultDevCredentials()) {
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

function defaultDevCredentials(): InstitutionCredential[] {
  // Dev only — override via AST_INSTITUTION_SECRETS_JSON
  const json = process.env.AST_INSTITUTION_SECRETS_JSON;
  if (json) {
    try {
      return JSON.parse(json) as InstitutionCredential[];
    } catch {
      /* fall through */
    }
  }
  return [
    { institutionId: 'DEMO', token: 'demo-institution-token', allowlisted: true },
  ];
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
