export interface PortalSession {
  sessionId: string;
  institutionId: string;
  displayName: string;
  expiresAt: string;
}

const KEY = 'ast_portal_session';

export function loadSession(): PortalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as PortalSession;
    if (Date.parse(s.expiresAt) < Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveSession(s: PortalSession): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}

export function apiBase(): string {
  return process.env.NEXT_PUBLIC_PORTAL_API_URL ?? 'http://localhost:3100';
}

export async function portalFetch(
  path: string,
  init: RequestInit & { sessionId?: string; idempotencyKey?: string } = {},
): Promise<Response> {
  const { sessionId, idempotencyKey, headers, ...rest } = init;
  const h = new Headers(headers);
  h.set('content-type', 'application/json');
  if (sessionId) h.set('X-Session-Id', sessionId);
  if (idempotencyKey) h.set('Idempotency-Key', idempotencyKey);
  return fetch(`${apiBase()}${path}`, { ...rest, headers: h });
}
