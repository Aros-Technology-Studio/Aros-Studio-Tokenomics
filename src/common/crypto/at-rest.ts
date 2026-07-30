/**
 * Application-level encryption at rest for durable NodeChain storage (B2).
 * AES-256-GCM; master key from AST_JOURNAL_AT_REST_KEY or journal-dir file.
 * Memory engine stays plaintext. Keys never committed to git.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

export const AT_REST_ALG = 'aes-256-gcm' as const;
export const AT_REST_KEY_FILE = 'at-rest.key';

export interface AtRestEnvelope {
  v: 1;
  alg: typeof AT_REST_ALG;
  iv: string;
  tag: string;
  data: string;
}

export function isAtRestEnvelope(value: unknown): value is AtRestEnvelope {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    o.v === 1 &&
    o.alg === AT_REST_ALG &&
    typeof o.iv === 'string' &&
    typeof o.tag === 'string' &&
    typeof o.data === 'string'
  );
}

/** Whether durable journal engines should encrypt blobs. Default: on. */
export function journalEncryptEnabled(): boolean {
  const v = (process.env.AST_JOURNAL_ENCRYPT ?? '1').trim().toLowerCase();
  return !(v === '0' || v === 'false' || v === 'off' || v === 'no');
}

export function masterKeyFromHex(hex: string): Buffer {
  const clean = hex.replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length < 32) {
    throw new Error('AST_JOURNAL_AT_REST_KEY must be hex, at least 32 chars (16 bytes)');
  }
  return createHash('sha256').update(Buffer.from(clean.padEnd(64, '0').slice(0, 64), 'hex')).digest();
}

export function generateMasterKeyHex(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Resolve 32-byte AES key: env → key file → create key file (durable engines).
 */
export async function loadOrCreateAtRestKey(journalDir: string): Promise<Buffer> {
  const fromEnv = process.env.AST_JOURNAL_AT_REST_KEY?.trim();
  if (fromEnv) {
    return masterKeyFromHex(fromEnv);
  }
  const keyPath = path.join(journalDir, AT_REST_KEY_FILE);
  try {
    const raw = (await fs.readFile(keyPath, 'utf8')).trim();
    if (raw) return masterKeyFromHex(raw);
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  await fs.mkdir(journalDir, { recursive: true });
  const hex = generateMasterKeyHex();
  await fs.writeFile(keyPath, hex + '\n', { encoding: 'utf8', mode: 0o600 });
  return masterKeyFromHex(hex);
}

export class JournalAtRestCipher {
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) {
      throw new Error('JournalAtRestCipher requires 32-byte key');
    }
  }

  sealUtf8(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(AT_REST_ALG, this.key, iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const env: AtRestEnvelope = {
      v: 1,
      alg: AT_REST_ALG,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      data: enc.toString('hex'),
    };
    return JSON.stringify(env);
  }

  openUtf8(stored: string): string {
    let parsed: unknown;
    try {
      parsed = JSON.parse(stored);
    } catch {
      // Legacy plaintext line
      return stored;
    }
    if (!isAtRestEnvelope(parsed)) {
      // Legacy plaintext JSON (journal record / tip / clients)
      return stored;
    }
    const iv = Buffer.from(parsed.iv, 'hex');
    const tag = Buffer.from(parsed.tag, 'hex');
    const data = Buffer.from(parsed.data, 'hex');
    const decipher = createDecipheriv(AT_REST_ALG, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }

  /** Encode value for durable write (encrypt when enabled path uses this cipher). */
  encode(value: unknown): string {
    return this.sealUtf8(JSON.stringify(value));
  }

  /** Decode durable blob → object (supports legacy plaintext JSON). */
  decode<T>(stored: string): T {
    const plain = this.openUtf8(stored);
    return JSON.parse(plain) as T;
  }
}
