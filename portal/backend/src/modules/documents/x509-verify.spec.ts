import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createSign, createVerify, generateKeyPairSync, X509Certificate } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  extractPemCertificates,
  loadTrustAnchorsFromEnv,
  verifyX509Detached,
} from './x509-verify';

function repoFixtureDir(): string {
  return path.resolve(__dirname, '../../../../../fixtures/x509-demo');
}

describe('x509-verify (D4)', () => {
  const fixtureDir = repoFixtureDir();
  const samplePath = path.join(fixtureDir, 'sample-detached.json');
  const hasFixtures = fs.existsSync(samplePath);

  it('extracts multiple PEMs from a bundle', () => {
    const a = `-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----`;
    const b = `-----BEGIN CERTIFICATE-----\nMIIB2\n-----END CERTIFICATE-----`;
    assert.equal(extractPemCertificates(`${a}\n${b}`).length, 2);
  });

  it('rejects bad hash', () => {
    const r = verifyX509Detached(
      {
        documentPackageHash: 'deadbeef',
        signerCertificatePem: 'x',
        signatureBase64: 'YQ==',
      },
      { AST_X509_USE_DEMO_TRUST: '0', AST_X509_ALLOW_SELF_SIGNED: '0' },
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, 'MISSING_DOCUMENTS');
  });

  it('rejects missing cert', () => {
    const hash = createHash('sha256').update('x').digest('hex');
    const r = verifyX509Detached(
      {
        documentPackageHash: hash,
        signerCertificatePem: '',
        signatureBase64: Buffer.alloc(64).toString('base64'),
      },
      { AST_X509_USE_DEMO_TRUST: '0' },
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, 'X509_CERT_INVALID');
  });

  it('verifies demo fixture detached signature against demo CA', { skip: !hasFixtures }, () => {
    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8')) as {
      documentPackageHash: string;
      signatureBase64: string;
      signerCertificatePem: string;
      trustAnchorPem: string;
    };
    const r = verifyX509Detached(
      {
        documentPackageHash: sample.documentPackageHash,
        signerCertificatePem: sample.signerCertificatePem,
        signatureBase64: sample.signatureBase64,
      },
      {
        AST_X509_TRUST_PEMS: sample.trustAnchorPem,
        AST_X509_USE_DEMO_TRUST: '0',
        AST_X509_ALLOW_SELF_SIGNED: '0',
      },
    );
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.mode, 'x509_detached');
      assert.ok(r.subject.toUpperCase().includes('PILOT'));
      assert.ok(r.chainDepth >= 2);
    }
  });

  it('fails closed on tampered signature', { skip: !hasFixtures }, () => {
    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8')) as {
      documentPackageHash: string;
      signatureBase64: string;
      signerCertificatePem: string;
      trustAnchorPem: string;
    };
    const bad = Buffer.from(sample.signatureBase64, 'base64');
    bad[0] ^= 0xff;
    const r = verifyX509Detached(
      {
        documentPackageHash: sample.documentPackageHash,
        signerCertificatePem: sample.signerCertificatePem,
        signatureBase64: bad.toString('base64'),
      },
      {
        AST_X509_TRUST_PEMS: sample.trustAnchorPem,
        AST_X509_USE_DEMO_TRUST: '0',
      },
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, 'X509_SIGNATURE_INVALID');
  });

  it('fails closed when trust anchor missing', { skip: !hasFixtures }, () => {
    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8')) as {
      documentPackageHash: string;
      signatureBase64: string;
      signerCertificatePem: string;
    };
    const r = verifyX509Detached(
      {
        documentPackageHash: sample.documentPackageHash,
        signerCertificatePem: sample.signerCertificatePem,
        signatureBase64: sample.signatureBase64,
      },
      {
        AST_X509_USE_DEMO_TRUST: '0',
        AST_X509_ALLOW_SELF_SIGNED: '0',
        AST_X509_TRUST_PEMS: '',
        AST_X509_TRUST_DIR: '',
        AST_X509_TRUST_FILE: '',
      },
    );
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.ok(
        r.code === 'X509_TRUST_NOT_CONFIGURED' || r.code === 'X509_CHAIN_UNTRUSTED',
        r.code,
      );
    }
  });

  it('loads trust dir anchors', { skip: !hasFixtures }, () => {
    const trustDir = path.join(fixtureDir, 'trust');
    const anchors = loadTrustAnchorsFromEnv({
      AST_X509_TRUST_DIR: trustDir,
      AST_X509_USE_DEMO_TRUST: '0',
    });
    assert.ok(anchors.length >= 1);
    assert.ok(anchors[0] instanceof X509Certificate);
  });

  it('documents signed message shape (32 raw hash bytes)', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const hashHex = createHash('sha256').update('contract').digest('hex');
    const hashBytes = Buffer.from(hashHex, 'hex');
    const s = createSign('RSA-SHA256');
    s.update(hashBytes);
    s.end();
    const sig = s.sign(privateKey);
    const v = createVerify('RSA-SHA256');
    v.update(hashBytes);
    v.end();
    assert.equal(v.verify(publicKey, sig), true);
    assert.equal(hashBytes.length, 32);
  });
});
