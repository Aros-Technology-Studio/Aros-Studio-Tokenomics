import { createHash } from 'crypto';

export function sha256Hex(input: string | Buffer): string {
  return createHash('sha256').update(input).digest('hex');
}

export function contentHash(payload: unknown): string {
  const canonical = JSON.stringify(payload);
  return sha256Hex(canonical);
}
