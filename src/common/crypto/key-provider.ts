import type { RecordSignature } from '../../nodechain/types';
import {
  generateEd25519KeyPair,
  signContentHash,
  verifyContentHash,
  type KeyPair,
} from './ed25519';
import { KeyRegistry } from './key-registry';
import { createHmac, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Pluggable signing backend (issue #68).
 * Production: HSM — private material never leaves the provider.
 * Dev: file/memory via KeyRegistry.
 */
export interface KeyProvider {
  readonly kind: 'memory' | 'file' | 'hsm';
  hasPrivate(keyId: string): boolean;
  getPublic(keyId: string): string | undefined;
  sign(keyId: string, contentHashHex: string): RecordSignature;
  verify(sig: RecordSignature, contentHashHex: string): boolean;
  verifyAll(signatures: RecordSignature[], contentHashHex: string): boolean;
  /** Public keys only — never private PEMs in HSM mode export. */
  exportPublicDirectory(): Array<{ keyId: string; publicKeyPem: string }>;
  /** Dev only — undefined for HSM. */
  asKeyRegistry?(): KeyRegistry | undefined;
}

/** Adapt existing KeyRegistry to KeyProvider. */
export class RegistryKeyProvider implements KeyProvider {
  readonly kind: 'memory' | 'file';

  constructor(
    private readonly registry: KeyRegistry,
    kind: 'memory' | 'file' = 'memory',
  ) {
    this.kind = kind;
  }

  hasPrivate(keyId: string): boolean {
    return this.registry.hasPrivate(keyId);
  }

  getPublic(keyId: string): string | undefined {
    return this.registry.getPublic(keyId);
  }

  sign(keyId: string, contentHashHex: string): RecordSignature {
    return this.registry.sign(keyId, contentHashHex);
  }

  verify(sig: RecordSignature, contentHashHex: string): boolean {
    return this.registry.verify(sig, contentHashHex);
  }

  verifyAll(signatures: RecordSignature[], contentHashHex: string): boolean {
    return this.registry.verifyAll(signatures, contentHashHex);
  }

  exportPublicDirectory(): Array<{ keyId: string; publicKeyPem: string }> {
    return this.registry.listKeyPairs().map((kp) => ({
      keyId: kp.keyId,
      publicKeyPem: kp.publicKeyPem,
    }));
  }

  asKeyRegistry(): KeyRegistry {
    return this.registry;
  }
}

interface HsmBlob {
  version: 1;
  kind: 'soft-hsm';
  /** AES-256-GCM sealed private keys keyed by keyId */
  sealed: Record<string, { iv: string; tag: string; data: string; publicKeyPem: string }>;
}

/**
 * Software HSM vault: private keys encrypted at rest with AST_HSM_MASTER_KEY.
 * Sign/verify only — no plaintext private export (asKeyRegistry undefined).
 * Production swaps this for PKCS#11 / cloud KMS with the same KeyProvider surface.
 */
export class HsmKeyProvider implements KeyProvider {
  readonly kind = 'hsm' as const;
  private readonly master: Buffer;
  private readonly sealed = new Map<
    string,
    { iv: Buffer; tag: Buffer; data: Buffer; publicKeyPem: string }
  >();
  private readonly cache = new Map<string, KeyPair>(); // unlocked in-process only

  constructor(masterKeyHex?: string) {
    const raw =
      masterKeyHex ??
      process.env.AST_HSM_MASTER_KEY ??
      createHmac('sha256', 'ast-dev-soft-hsm').update('local').digest('hex');
    this.master = Buffer.from(raw.padEnd(64, '0').slice(0, 64), 'hex');
  }

  static async loadOrCreate(vaultPath: string, keyIds: readonly string[]): Promise<HsmKeyProvider> {
    const provider = new HsmKeyProvider();
    try {
      const raw = await fs.readFile(vaultPath, 'utf8');
      const blob = JSON.parse(raw) as HsmBlob;
      for (const [id, s] of Object.entries(blob.sealed ?? {})) {
        provider.sealed.set(id, {
          iv: Buffer.from(s.iv, 'hex'),
          tag: Buffer.from(s.tag, 'hex'),
          data: Buffer.from(s.data, 'hex'),
          publicKeyPem: s.publicKeyPem,
        });
      }
    } catch {
      /* new vault */
    }
    for (const id of keyIds) {
      if (!provider.hasPrivate(id)) {
        provider.generate(id);
      }
    }
    await fs.mkdir(path.dirname(vaultPath), { recursive: true });
    await provider.persist(vaultPath);
    return provider;
  }

  generate(keyId: string): void {
    const kp = generateEd25519KeyPair(keyId);
    this.seal(kp);
    this.cache.set(keyId, kp);
  }

  hasPrivate(keyId: string): boolean {
    return this.sealed.has(keyId) || this.cache.has(keyId);
  }

  getPublic(keyId: string): string | undefined {
    return this.cache.get(keyId)?.publicKeyPem ?? this.sealed.get(keyId)?.publicKeyPem;
  }

  sign(keyId: string, contentHashHex: string): RecordSignature {
    const kp = this.unlock(keyId);
    return {
      signerId: keyId,
      algorithm: 'ed25519',
      signature: signContentHash(kp.privateKeyPem, contentHashHex),
      signedOver: 'contentHash',
    };
  }

  verify(sig: RecordSignature, contentHashHex: string): boolean {
    if (sig.algorithm !== 'ed25519') return false;
    const pub = this.getPublic(sig.signerId);
    if (!pub) return false;
    return verifyContentHash(pub, contentHashHex, sig.signature);
  }

  verifyAll(signatures: RecordSignature[], contentHashHex: string): boolean {
    return signatures.length > 0 && signatures.every((s) => this.verify(s, contentHashHex));
  }

  exportPublicDirectory(): Array<{ keyId: string; publicKeyPem: string }> {
    return [...this.sealed.entries()].map(([keyId, s]) => ({
      keyId,
      publicKeyPem: s.publicKeyPem,
    }));
  }

  /** HSM mode: no KeyRegistry export of private PEMs. */
  asKeyRegistry(): undefined {
    return undefined;
  }

  /**
   * Bridge for code that still needs KeyRegistry: inject only public keys +
   * wrap sign via a thin adapter registry that delegates to this provider.
   */
  toSigningRegistry(): KeyRegistry {
    const reg = new KeyRegistry();
    // Register public only — signing overridden via proxy pattern on returned object
    for (const { keyId, publicKeyPem } of this.exportPublicDirectory()) {
      reg.registerPublic(keyId, publicKeyPem);
    }
    const self = this;
    return new Proxy(reg, {
      get(target, prop, receiver) {
        if (prop === 'sign') {
          return (keyId: string, contentHashHex: string) => self.sign(keyId, contentHashHex);
        }
        if (prop === 'hasPrivate') {
          return (keyId: string) => self.hasPrivate(keyId);
        }
        if (prop === 'verify') {
          return (sig: RecordSignature, hash: string) => self.verify(sig, hash);
        }
        if (prop === 'verifyAll') {
          return (sigs: RecordSignature[], hash: string) => self.verifyAll(sigs, hash);
        }
        if (prop === 'getPublic') {
          return (keyId: string) => self.getPublic(keyId);
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as KeyRegistry;
  }

  async persist(vaultPath: string): Promise<void> {
    const sealed: HsmBlob['sealed'] = {};
    for (const [id, s] of this.sealed) {
      sealed[id] = {
        iv: s.iv.toString('hex'),
        tag: s.tag.toString('hex'),
        data: s.data.toString('hex'),
        publicKeyPem: s.publicKeyPem,
      };
    }
    const blob: HsmBlob = { version: 1, kind: 'soft-hsm', sealed };
    await fs.writeFile(vaultPath, JSON.stringify(blob, null, 2), 'utf8');
  }

  private seal(kp: KeyPair): void {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.master.subarray(0, 32), iv);
    const enc = Buffer.concat([
      cipher.update(Buffer.from(kp.privateKeyPem, 'utf8')),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    this.sealed.set(kp.keyId, {
      iv,
      tag,
      data: enc,
      publicKeyPem: kp.publicKeyPem,
    });
  }

  private unlock(keyId: string): KeyPair {
    const cached = this.cache.get(keyId);
    if (cached) return cached;
    const s = this.sealed.get(keyId);
    if (!s) throw new Error(`HSM: no key ${keyId}`);
    const decipher = createDecipheriv('aes-256-gcm', this.master.subarray(0, 32), s.iv);
    decipher.setAuthTag(s.tag);
    const priv = Buffer.concat([decipher.update(s.data), decipher.final()]).toString('utf8');
    const kp: KeyPair = {
      keyId,
      privateKeyPem: priv,
      publicKeyPem: s.publicKeyPem,
    };
    this.cache.set(keyId, kp);
    return kp;
  }
}

export type KeyProviderKind = 'memory' | 'file' | 'hsm';

export function resolveKeyProviderKind(
  env: NodeJS.ProcessEnv = process.env,
): KeyProviderKind {
  const v = (env.AST_KEY_PROVIDER ?? 'file').toLowerCase();
  if (v === 'hsm' || v === 'file' || v === 'memory') return v;
  return 'file';
}
