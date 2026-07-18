import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { attestationDigest, signAttestation, verifyAttestations } from './attestation';

describe('PoT attestations', () => {
  it('signs and verifies digest', () => {
    const keys = bootstrapPipelineKeys();
    const digest = attestationDigest({
      processId: 'p1',
      processType: 'primary_tokenization',
      tipHash: 'aa'.repeat(32),
      tipHeight: 3,
      stagesCompleted: ['opened', 'documents', 'encoded'],
      institutionAllowlisted: true,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    const a = signAttestation(keys, 'v1', digest);
    const check = verifyAttestations(keys, digest, [a], ['v1', 'v2', 'v3']);
    expect(check.ok).toBe(true);
    expect(check.validConfirmers).toEqual(['v1']);
  });

  it('rejects wrong digest', () => {
    const keys = bootstrapPipelineKeys();
    const digest = attestationDigest({
      processId: 'p1',
      processType: 'primary_tokenization',
      tipHash: 'bb'.repeat(32),
      tipHeight: 1,
      stagesCompleted: ['opened'],
      institutionAllowlisted: true,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    const a = signAttestation(keys, 'v1', digest);
    const check = verifyAttestations(keys, '00'.repeat(32), [a], ['v1']);
    expect(check.validConfirmers).toHaveLength(0);
  });
});
