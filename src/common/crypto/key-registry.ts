import {
  generateEd25519KeyPair,
  signContentHash,
  verifyContentHash,
  type KeyPair } from './ed25519';
import type { RecordSignature } from '../../nodechain/types';

/**
 * Key registry for writers/confirmers.
 * Production: inject HSM-backed implementation with the same methods.
 */
export class KeyRegistry {
  private keys = new Map<string, KeyPair>();
  private pubOnly = new Map<string, string>();

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

  listKeyPairs(): KeyPair[] {
    return [...this.keys.values()];
  }

  getPublic(keyId: string): string | undefined {
    return this.pubOnly.get(keyId) ?? this.keys.get(keyId)?.publicKeyPem;
  }

  sign(keyId: string, contentHashHex: string): RecordSignature {
    const kp = this.keys.get(keyId);
    if (!kp) {
      throw new Error(`no private key for ${keyId}`);
    }
    return {
      signerId: keyId,
      algorithm: 'ed25519',
      signature: signContentHash(kp.privateKeyPem, contentHashHex),
      signedOver: 'contentHash' };
  }

  verify(sig: RecordSignature, contentHashHex: string): boolean {
    if (sig.algorithm !== 'ed25519') {
      return false;
    }
    const pub = this.getPublic(sig.signerId);
    if (!pub) {
      return false;
    }
    return verifyContentHash(pub, contentHashHex, sig.signature);
  }

  verifyAll(signatures: RecordSignature[], contentHashHex: string): boolean {
    if (!signatures.length) {
      return false;
    }
    return signatures.every((s) => this.verify(s, contentHashHex));
  }
}

export const defaultKeyRegistry = new KeyRegistry();
