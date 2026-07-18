import { InstitutionAuthService, verifyRequestHmac } from './institution-auth';
import { createHash, createHmac } from 'crypto';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import {
  hashUtf8,
  signDocumentPackageHash,
  verifyQualifiedSignature,
} from './qualified-signature';

describe('Institution auth + qualified signature (phase C)', () => {
  it('authenticates DEMO with token', () => {
    const auth = new InstitutionAuthService();
    const ok = auth.authenticate('DEMO', 'demo-institution-token');
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.allowlisted).toBe(true);
  });

  it('rejects bad token fail-closed', () => {
    const auth = new InstitutionAuthService();
    const bad = auth.authenticate('DEMO', 'wrong');
    expect(bad.ok).toBe(false);
  });

  it('verifies HMAC request binding', () => {
    const token = 'demo-institution-token';
    const bodyHash = createHash('sha256').update('{}').digest('hex');
    const sig = createHmac('sha256', token)
      .update(`POST\n/v1/core/processes\n${bodyHash}`)
      .digest('hex');
    expect(
      verifyRequestHmac({
        token,
        method: 'POST',
        path: '/v1/core/processes',
        bodyHash,
        signatureHex: sig,
      }),
    ).toBe(true);
  });

  it('verifies qualified signature over document package hash', () => {
    const keys = bootstrapPipelineKeys();
    keys.registerGenerated('inst-signer');
    const docHash = hashUtf8('valuation-package-v1');
    const signature = signDocumentPackageHash(keys, 'inst-signer', docHash);
    const r = verifyQualifiedSignature(keys, {
      documentPackageHash: docHash,
      signerId: 'inst-signer',
      signature,
    });
    expect(r.ok).toBe(true);
  });
});
