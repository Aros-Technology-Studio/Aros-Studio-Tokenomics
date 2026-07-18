import { createHash } from 'crypto';
import type { KeyRegistry } from '../common/crypto/key-registry';
import { canonicalJson } from '../nodechain/hash';
import { PotReason } from './reason-codes';

export interface ConfirmerAttestation {
  validatorId: string;
  /** Ed25519 signature over attestationDigest (base64). */
  signature: string;
  signedAtUtc: string;
  algorithm: 'ed25519';
}

export interface AttestationCheck {
  ok: boolean;
  validConfirmers: string[];
  reasonCodes: string[];
  digest: string;
}

/**
 * Domain-separated digest confirmers must sign.
 * Binds process + journal tip + stages + institution flags (no amounts).
 */
export function attestationDigest(input: {
  processId: string;
  processType: string;
  tipHash: string;
  tipHeight: number;
  stagesCompleted: string[];
  institutionAllowlisted: boolean;
  hasDocuments: boolean;
  hasQualifiedSignature: boolean;
}): string {
  const material = canonicalJson({
    domain: 'AST-POT-ATTEST-v1',
    processId: input.processId,
    processType: input.processType,
    tipHash: input.tipHash,
    tipHeight: input.tipHeight,
    stagesCompleted: [...input.stagesCompleted].sort(),
    institutionAllowlisted: input.institutionAllowlisted,
    hasDocuments: input.hasDocuments,
    hasQualifiedSignature: input.hasQualifiedSignature,
  });
  return createHash('sha256').update(material).digest('hex');
}

export function signAttestation(
  keys: KeyRegistry,
  validatorId: string,
  digestHex: string,
): ConfirmerAttestation {
  const sig = keys.sign(validatorId, digestHex);
  return {
    validatorId,
    signature: sig.signature,
    signedAtUtc: new Date().toISOString(),
    algorithm: 'ed25519',
  };
}

/**
 * Verify each attestation over digest with KeyRegistry public keys.
 * Only validators in eligible set count.
 */
export function verifyAttestations(
  keys: KeyRegistry,
  digestHex: string,
  attestations: ConfirmerAttestation[],
  eligibleValidatorIds: string[],
): AttestationCheck {
  const reasonCodes: string[] = [];
  const eligible = new Set(eligibleValidatorIds);
  const validConfirmers: string[] = [];
  const seen = new Set<string>();

  if (!attestations.length) {
    reasonCodes.push(PotReason.ATTESTATION_MISSING);
    return { ok: false, validConfirmers, reasonCodes, digest: digestHex };
  }

  for (const a of attestations) {
    if (seen.has(a.validatorId)) {
      reasonCodes.push(`${PotReason.ATTESTATION_DUPLICATE}:${a.validatorId}`);
      continue;
    }
    seen.add(a.validatorId);

    if (!eligible.has(a.validatorId)) {
      reasonCodes.push(`${PotReason.ATTESTATION_NOT_ELIGIBLE}:${a.validatorId}`);
      continue;
    }
    if (a.algorithm !== 'ed25519') {
      reasonCodes.push(`${PotReason.ATTESTATION_BAD_ALG}:${a.validatorId}`);
      continue;
    }
    const ok = keys.verify(
      {
        signerId: a.validatorId,
        algorithm: 'ed25519',
        signature: a.signature,
        signedOver: 'contentHash',
      },
      digestHex,
    );
    if (!ok) {
      reasonCodes.push(`${PotReason.ATTESTATION_BAD_SIG}:${a.validatorId}`);
      continue;
    }
    validConfirmers.push(a.validatorId);
  }

  const ok = validConfirmers.length > 0 && reasonCodes.every((c) => !c.startsWith('ATTESTATION_MISSING'));
  // ok means we have at least one valid attestation; quorum is separate
  return {
    ok: validConfirmers.length > 0,
    validConfirmers,
    reasonCodes,
    digest: digestHex,
  };
}
