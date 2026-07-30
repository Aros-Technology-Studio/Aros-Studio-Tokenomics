/**
 * D6 — mTLS map + OIDC HS256 pilot helpers (edge).
 * TLS terminate at reverse proxy; full IdP/JWKS residual.
 */
import { createHmac, timingSafeEqual } from 'crypto';
import * as fs from 'fs';

export type MtlsMapEntry = {
  subjectContains: string;
  institutionId: string;
  displayName?: string;
};

export function passwordLoginAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  const reqM = env.AST_REQUIRE_MTLS === '1' || env.AST_REQUIRE_MTLS === 'true';
  const reqO = env.AST_REQUIRE_OIDC === '1' || env.AST_REQUIRE_OIDC === 'true';
  return !(reqM || reqO);
}

export function mtlsTrustProxy(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.AST_MTLS_TRUST_PROXY === '1' || env.AST_MTLS_TRUST_PROXY === 'true';
}

export function loadMtlsMap(env: NodeJS.ProcessEnv = process.env): MtlsMapEntry[] {
  const inline = env.AST_MTLS_MAP_JSON?.trim();
  if (inline) {
    try {
      const p = JSON.parse(inline) as MtlsMapEntry[];
      if (Array.isArray(p)) {
        return p
          .map((e) => ({
            subjectContains: String(e.subjectContains ?? ''),
            institutionId: String(e.institutionId ?? '').toUpperCase(),
            displayName: e.displayName ? String(e.displayName) : undefined,
          }))
          .filter((e) => e.subjectContains && e.institutionId);
      }
    } catch {
      return [];
    }
  }
  const file = env.AST_MTLS_MAP_FILE?.trim();
  if (file && fs.existsSync(file)) {
    try {
      const p = JSON.parse(fs.readFileSync(file, 'utf8')) as MtlsMapEntry[];
      if (Array.isArray(p)) {
        return p
          .map((e) => ({
            subjectContains: String(e.subjectContains ?? ''),
            institutionId: String(e.institutionId ?? '').toUpperCase(),
            displayName: e.displayName ? String(e.displayName) : undefined,
          }))
          .filter((e) => e.subjectContains && e.institutionId);
      }
    } catch {
      return [];
    }
  }
  return [];
}

export function subjectFromMtlsHeaders(
  headers: Record<string, string | string[] | undefined>,
): string | null {
  const pick = (k: string) => {
    const v = headers[k] ?? headers[k.toLowerCase()];
    if (Array.isArray(v)) return v[0]?.trim() || null;
    return typeof v === 'string' ? v.trim() || null : null;
  };
  return (
    pick('x-ssl-client-s-dn') ||
    pick('x-client-cert-subject') ||
    pick('ssl-client-subject-dn') ||
    null
  );
}

export function mapSubjectToInstitution(
  subject: string,
  map: MtlsMapEntry[],
): MtlsMapEntry | null {
  const s = subject.toUpperCase();
  for (const e of map) {
    if (s.includes(e.subjectContains.toUpperCase())) return e;
  }
  return null;
}

/** Minimal HS256 JWT verify (pilot). Not full OIDC discovery. */
export function verifyOidcHs256(
  token: string,
  secret: string,
  opts?: { audience?: string; issuer?: string },
):
  | { ok: true; claims: Record<string, unknown> }
  | { ok: false; code: string; message: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, code: 'OIDC_INVALID', message: 'JWT must have 3 parts' };
  }
  const [h, p, sig] = parts;
  const data = `${h}.${p}`;
  const expected = createHmac('sha256', secret).update(data).digest('base64url');
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, code: 'OIDC_INVALID', message: 'JWT signature invalid' };
  }
  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >;
  } catch {
    return { ok: false, code: 'OIDC_INVALID', message: 'JWT payload not JSON' };
  }
  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp === 'number' && claims.exp < now) {
    return { ok: false, code: 'OIDC_EXPIRED', message: 'JWT expired' };
  }
  if (opts?.issuer && claims.iss !== opts.issuer) {
    return { ok: false, code: 'OIDC_INVALID', message: 'iss mismatch' };
  }
  if (opts?.audience) {
    const aud = claims.aud;
    const ok =
      aud === opts.audience ||
      (Array.isArray(aud) && aud.includes(opts.audience));
    if (!ok) return { ok: false, code: 'OIDC_INVALID', message: 'aud mismatch' };
  }
  return { ok: true, claims };
}

export function institutionIdFromClaims(claims: Record<string, unknown>): string | null {
  const raw =
    claims.institution_id ??
    claims.institutionId ??
    claims.sub ??
    claims.preferred_username;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  return raw.trim().toUpperCase();
}

export function b64urlJson(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
}

export function signOidcHs256(
  claims: Record<string, unknown>,
  secret: string,
): string {
  const h = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const p = b64urlJson(claims);
  const sig = createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${sig}`;
}
