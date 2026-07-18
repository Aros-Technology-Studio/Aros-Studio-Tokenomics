import {
  generateEd25519KeyPair,
  signContentHash,
  verifyContentHash,
  type KeyPair,
} from './ed25519';
import type { RecordSignature } from '../../nodechain/types';

/**
 * In-process key registry for writers/confirmers.
 * Production would load from HSM / sealed config — interface stays the same.
 */
export class KeyRegistry {
  private keys = new Map<string, KeyPair>();
  private pubOnly = new Map<string, string>(); // keyId -> pem

  registerGenerated(keyId: string): KeyPair {
    const kp = generateEd25519KeyPair(keyId);
    this.keys.set(keyId, kp);
    this.pubOnly.set(keyId, kp.publicKeyPem);
    return kp;
  }

  registerPublic(keyId: string, publicKeyPem: string): void {
    this.pubOnly.set(keyId, publicKeyPem);
  }

  registerKeyPair(kp: KeyPair): void {
    this.keys.set(kp.keyId, kp);
    this.pubOnly.set(kp.keyId, kp.publicKeyPem);
  }

  hasPrivate(keyId: string): boolean {
    return this.keys.has(keyId);
  }

  getPublic(keyId: string): string | undefined {
    return this.pubOnly.get(keyId) ?? this.keys.get(keyId)?.publicKeyPem;
  }

  sign(keyId: string, contentHashHex: string): RecordSignature {
    const kp = this.keys.get(keyId);
    if (!kp) throw new Error(`no private key for ${keyId}`);
    return {
      signerId: keyId,
      algorithm: 'ed25519',
      signature: signContentHash(kp.privateKeyPem, contentHashHex),
      signedOver: 'contentHash',
    };
  }

  verify(sig: RecordSignature, contentHashHex: string): boolean {
    if (sig.algorithm === 'dev-self-attest') {
      // legacy/dev only when ALLOW_DEV_ATTEST=1
      if (process.env.ALLOW_DEV_ATTEST === '1') {
        return sig.signature === contentHashHex.slice(0, 32);
      }
      return false;
    }
    if (sig.algorithm !== 'ed25519') return false;
    const pub = this.getPublic(sig.signerId);
    if (!pub) return false;
    return verifyContentHash(pub, contentHashHex, sig.signature);
  }

  verifyAll(signatures: RecordSignature[], contentHashHex: string): boolean {
    if (!signatures.length) return false;
    return signatures.every((s) => this.verify(s, contentHashHex));
  }
}

/** Shared default registry for demos/tests (populated by bootstrap). */
export const defaultKeyRegistry = new KeyRegistry();
