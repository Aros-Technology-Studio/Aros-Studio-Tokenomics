import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

/**
 * At-rest protection for sensitive fields (nodechain pack).
 * Key from NODECHAIN_AT_REST_KEY (32-byte hex) or derived dev default (not for prod).
 */
export function encryptSensitivePayload(payload: unknown): {
  ciphertext: string;
  iv: string;
  tag: string;
  alg: 'aes-256-gcm';
} {
  const key = resolveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plain = Buffer.from(JSON.stringify(payload), 'utf8');
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    alg: 'aes-256-gcm',
  };
}

export function decryptSensitivePayload(box: {
  ciphertext: string;
  iv: string;
  tag: string;
}): unknown {
  const key = resolveKey();
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(box.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(box.tag, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(box.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(dec.toString('utf8'));
}

function resolveKey(): Buffer {
  const hex = process.env.NODECHAIN_AT_REST_KEY;
  if (hex && /^[0-9a-fA-F]{64}$/.test(hex)) {
    return Buffer.from(hex, 'hex');
  }
  // Deterministic dev key — production must set NODECHAIN_AT_REST_KEY
  return createHash('sha256').update('AST-DEV-NODECHAIN-AT-REST').digest();
}
