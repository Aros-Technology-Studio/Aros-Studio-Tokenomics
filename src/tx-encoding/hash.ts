import { createHash } from 'crypto';
import { canonicalEncode } from './canonical';

export function sha256HexUtf8(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function payloadHash(value: unknown): string {
  return sha256HexUtf8(canonicalEncode(value));
}
