/**
 * HTTP client from Portal edge → AST core Orchestrator API.
 * Core base URL: CORE_API_URL (default http://localhost:3000/v1)
 */

const CORE = () => process.env.CORE_API_URL ?? 'http://localhost:3000/v1';

export async function coreStartProcess(body: {
  institutionCode: string;
  idempotencyKey: string;
  institutionalValuation: string;
  currency: string;
  assetType: string;
  holderId: string;
}): Promise<{
  processId: string;
  status: string;
  currentStep: string;
  createdAt: string;
}> {
  const res = await fetch(`${CORE()}/core/processes/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`core start failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<{
    processId: string;
    status: string;
    currentStep: string;
    createdAt: string;
  }>;
}

export async function coreGetProcess(processId: string): Promise<unknown> {
  const res = await fetch(
    `${CORE()}/core/processes/${encodeURIComponent(processId)}`,
  );
  if (!res.ok) {
    throw new Error(`core get process failed: ${res.status}`);
  }
  return res.json();
}
