import { createHash } from 'crypto';
import type { KeyRegistry } from '../common/crypto/key-registry';

const DOC_HASH_RE = /^[a-f0-9]{64}$/i;

export interface QualifiedSignaturePackage {
  /** SHA-256 hex of document package */
  documentPackageHash: string;
  /** Institution signer key id in registry */
  signerId: string;
  /** Ed25519 signature over documentPackageHash (hex digest) as contentHash */
  signature: string;
  /** Optional PEM / label for audit */
  certificateLabel?: string;
  algorithm?: 'ed25519';
}

export interface QualifiedSignatureResult {
  ok: boolean;
  reasonCodes: string[];
}

/**
 * Production-oriented КЭП check: Ed25519 over document package hash.
 * Full X.509 chain validation is a follow-on; this binds signer key + package hash.
 */
export function verifyQualifiedSignature(
  keys: KeyRegistry,
  pkg: QualifiedSignaturePackage,
): QualifiedSignatureResult {
  const reasonCodes: string[] = [];
  if (!DOC_HASH_RE.test(pkg.documentPackageHash ?? '')) {
    reasonCodes.push('QSIG_BAD_DOC_HASH');
  }
  if (!pkg.signerId?.trim()) {
    reasonCodes.push('QSIG_SIGNER_REQUIRED');
  }
  if (!pkg.signature?.trim()) {
    reasonCodes.push('QSIG_SIGNATURE_REQUIRED');
  }
  if (reasonCodes.length) {
    return { ok: false, reasonCodes };
  }
  const hash = pkg.documentPackageHash.toLowerCase();
  const ok = keys.verify(
    {
      signerId: pkg.signerId,
      algorithm: 'ed25519',
      signature: pkg.signature,
      signedOver: 'contentHash',
    },
    hash,
  );
  if (!ok) {
    return { ok: false, reasonCodes: ['QSIG_BAD_SIGNATURE'] };
  }
  return { ok: true, reasonCodes: [] };
}

export function hashUtf8(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Sign document package hash with institution key (sandbox helper). */
export function signDocumentPackageHash(
  keys: KeyRegistry,
  signerId: string,
  documentPackageHash: string,
): string {
  return keys.sign(signerId, documentPackageHash.toLowerCase()).signature;
}
