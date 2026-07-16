const API_BASE = process.env.NEXT_PUBLIC_PORTAL_API ?? 'http://localhost:3001/v1';

export async function startTokenization(body: {
  assetType: string;
  institutionalValuation: string;
  currency: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE}/tokenization/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`startTokenization failed: ${res.status}`);
  }
  return res.json();
}

export async function getProcess(processId: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/processes/${encodeURIComponent(processId)}`);
  if (!res.ok) {
    throw new Error(`getProcess failed: ${res.status}`);
  }
  return res.json();
}
