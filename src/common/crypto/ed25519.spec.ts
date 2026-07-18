import {
  generateEd25519KeyPair,
  signContentHash,
  verifyContentHash,
} from './ed25519';
import { createHash } from 'crypto';
import { KeyRegistry } from './key-registry';

describe('ed25519 crypto', () => {
  it('signs and verifies content hash', () => {
    const kp = generateEd25519KeyPair('k1');
    const hash = createHash('sha256').update('hello').digest('hex');
    const sig = signContentHash(kp.privateKeyPem, hash);
    expect(verifyContentHash(kp.publicKeyPem, hash, sig)).toBe(true);
    expect(verifyContentHash(kp.publicKeyPem, hash.replace(/0/g, '1'), sig)).toBe(false);
  });

  it('registry signs append signatures', () => {
    const reg = new KeyRegistry();
    reg.registerGenerated('writer-1');
    const hash = createHash('sha256').update('body').digest('hex');
    const s = reg.sign('writer-1', hash);
    expect(s.algorithm).toBe('ed25519');
    expect(reg.verify(s, hash)).toBe(true);
  });
});
