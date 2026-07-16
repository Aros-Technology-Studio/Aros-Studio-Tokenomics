/**
 * Client-side helpers for qualified e-signature workflows.
 * Full КЭП provider integration is environment-specific.
 * Web Crypto is used for local verification hooks where applicable.
 */

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Placeholder: integrate institutional КЭП middleware / browser extension.
 * Must produce a signature payload accepted by POST /v1/documents/upload.
 */
export async function signPayloadStub(_payload: ArrayBuffer): Promise<string> {
  void _payload;
  throw new Error(
    'КЭП signing not configured — integrate institutional signature provider',
  );
}
