import type { KeyRegistry } from '../common/crypto/key-registry';
import {
  decodeProcessTx,
  encodeProcessTx,
  packageSigningDigest,
  verifyEncodedPackage,
} from './encode';
import type { DecodeResult, EncodedProcessTx, ProcessTxInput } from './types';
import { listSchemas } from './schema';

export interface SignedPackage {
  package: EncodedProcessTx;
  signingDigest: string;
  signerId: string;
  signature: string;
  algorithm: 'ed25519';
}

/**
 * Layer 02 service facade — deterministic encode/decode/verify/sign-binding.
 */
export class EncodingService {
  encode(input: ProcessTxInput): EncodedProcessTx {
    return encodeProcessTx(input);
  }

  decode(encoded: string, expectedHash?: string): DecodeResult {
    return decodeProcessTx(encoded, expectedHash);
  }

  verify(pkg: EncodedProcessTx): boolean {
    return verifyEncodedPackage(pkg);
  }

  listSchemas() {
    return listSchemas();
  }

  /**
   * Sign package digest with writer key (institution or service).
   */
  signPackage(keys: KeyRegistry, signerId: string, pkg: EncodedProcessTx): SignedPackage {
    const signingDigest = packageSigningDigest(pkg);
    const sig = keys.sign(signerId, signingDigest);
    return {
      package: pkg,
      signingDigest,
      signerId,
      signature: sig.signature,
      algorithm: 'ed25519',
    };
  }

  verifyPackageSignature(
    keys: KeyRegistry,
    signed: SignedPackage,
  ): boolean {
    if (!this.verify(signed.package)) return false;
    const digest = packageSigningDigest(signed.package);
    if (digest !== signed.signingDigest) return false;
    return keys.verify(
      {
        signerId: signed.signerId,
        algorithm: 'ed25519',
        signature: signed.signature,
        signedOver: 'contentHash',
      },
      digest,
    );
  }
}
