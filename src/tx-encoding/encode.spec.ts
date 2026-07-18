import {
  encodeProcessTx,
  decodeProcessTx,
  verifyEncodedPackage,
  packageSigningDigest,
  canonicalEncode,
  TX_SCHEMA_VERSION,
} from './encode';
import { EncodingError } from './errors';
import { EncodingService } from './encoding.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';

const validId = 'AST-DEMO-20260718-abc123';

describe('TxEncoding (layer 02 deep)', () => {
  it('is deterministic for key order', () => {
    const a = encodeProcessTx({
      processId: validId,
      processType: 'primary_tokenization',
      body: { valuation: '100.000000000', institutionId: 'DEMO', holderId: 'h1' },
    });
    const b = encodeProcessTx({
      processId: validId,
      processType: 'primary_tokenization',
      body: { holderId: 'h1', institutionId: 'DEMO', valuation: '100.000000000' },
    });
    expect(a.payloadHash).toBe(b.payloadHash);
    expect(a.encoded).toBe(b.encoded);
    expect(a.schemaVersion).toBe(TX_SCHEMA_VERSION);
    expect(verifyEncodedPackage(a)).toBe(true);
  });

  it('rejects float amounts and number types', () => {
    expect(() =>
      encodeProcessTx({
        processId: validId,
        processType: 'primary_tokenization',
        body: {
          institutionId: 'DEMO',
          valuation: 100 as unknown as string,
          holderId: 'h',
        },
      }),
    ).toThrow(EncodingError);
  });

  it('rejects invalid amount format', () => {
    expect(() =>
      encodeProcessTx({
        processId: validId,
        processType: 'primary_tokenization',
        body: {
          institutionId: 'DEMO',
          valuation: '1e9',
          holderId: 'h',
        },
      }),
    ).toThrow(EncodingError);
  });

  it('rejects forbidden extra keys', () => {
    expect(() =>
      encodeProcessTx({
        processId: validId,
        processType: 'primary_tokenization',
        body: {
          institutionId: 'DEMO',
          valuation: '1.0',
          holderId: 'h',
          evil: 'x',
        } as never,
      }),
    ).toThrow(/forbidden field: evil/);
  });

  it('rejects invalid processId', () => {
    expect(() =>
      encodeProcessTx({
        processId: 'AST-BAD',
        processType: 'primary_tokenization',
        body: {
          institutionId: 'DEMO',
          valuation: '1.0',
          holderId: 'h',
        },
      }),
    ).toThrow(/invalid processId/);
  });

  it('validates revaluation schema', () => {
    const pkg = encodeProcessTx({
      processId: validId,
      processType: 'revaluation',
      body: {
        institutionId: 'DEMO',
        assetId: 'a1',
        previousValue: '100.000000000',
        newValue: '110.5',
      },
    });
    expect(pkg.body.newValue).toBe('110.5');
    expect(verifyEncodedPackage(pkg)).toBe(true);
  });

  it('rejects missing required fields', () => {
    expect(() =>
      encodeProcessTx({
        processId: validId,
        processType: 'primary_tokenization',
        body: {
          institutionId: 'DEMO',
          valuation: '1.0',
        } as never,
      }),
    ).toThrow(/missing field: holderId/);
  });

  it('normalizes hash fields to lowercase', () => {
    const hash = 'A'.repeat(64);
    const pkg = encodeProcessTx({
      processId: validId,
      processType: 'primary_tokenization',
      body: {
        institutionId: 'DEMO',
        valuation: '1.0',
        holderId: 'h',
        documentPackageHash: hash,
      },
    });
    expect(pkg.body.documentPackageHash).toBe(hash.toLowerCase());
  });

  it('validates ownership_transfer schema', () => {
    const pkg = encodeProcessTx({
      processId: validId,
      processType: 'ownership_transfer',
      body: {
        institutionId: 'DEMO',
        assetId: 'a1',
        fromHolderId: 'alice',
        toHolderId: 'bob',
        amount: '10.000000000',
      },
    });
    expect(pkg.body.fromHolderId).toBe('alice');
    expect(verifyEncodedPackage(pkg)).toBe(true);
  });

  it('rejects transfer to self', () => {
    expect(() =>
      encodeProcessTx({
        processId: validId,
        processType: 'ownership_transfer',
        body: {
          institutionId: 'DEMO',
          assetId: 'a1',
          fromHolderId: 'alice',
          toHolderId: 'alice',
          amount: '1.0',
        },
      }),
    ).toThrow(EncodingError);
  });

  it('decode round-trips and verifies hash', () => {
    const pkg = encodeProcessTx({
      processId: validId,
      processType: 'primary_tokenization',
      body: {
        institutionId: 'DEMO',
        valuation: '50.5',
        holderId: 'h1',
      },
    });
    const d = decodeProcessTx(pkg.encoded, pkg.payloadHash);
    expect(d.valid).toBe(true);
    expect(d.body.valuation).toBe('50.5');
    expect(d.payloadHash).toBe(pkg.payloadHash);
  });

  it('detects tampered encoded payload', () => {
    const pkg = encodeProcessTx({
      processId: validId,
      processType: 'primary_tokenization',
      body: {
        institutionId: 'DEMO',
        valuation: '1.0',
        holderId: 'h',
      },
    });
    const tampered = pkg.encoded.replace('DEMO', 'HACK');
    const d = decodeProcessTx(tampered, pkg.payloadHash);
    expect(d.valid).toBe(false);
    expect(d.reasonCodes.length).toBeGreaterThan(0);
  });

  it('canonicalEncode rejects non-integer numbers', () => {
    expect(() => canonicalEncode({ x: 1.5 })).toThrow(/non-integer/);
  });

  it('package signature binds with ed25519', () => {
    const keys = bootstrapPipelineKeys();
    const svc = new EncodingService();
    const pkg = svc.encode({
      processId: validId,
      processType: 'primary_tokenization',
      body: {
        institutionId: 'DEMO',
        valuation: '10.000000000',
        holderId: 'h',
      },
    });
    const signed = svc.signPackage(keys, 'system', pkg);
    expect(svc.verifyPackageSignature(keys, signed)).toBe(true);
    expect(packageSigningDigest(pkg)).toBe(signed.signingDigest);
  });

  it('lists process schemas', () => {
    const schemas = new EncodingService().listSchemas();
    expect(schemas.map((s) => s.processType)).toEqual(
      expect.arrayContaining(['primary_tokenization', 'revaluation', 'ownership_transfer']),
    );
  });
});
