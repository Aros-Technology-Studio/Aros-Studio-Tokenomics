import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { HsmKeyProvider, RegistryKeyProvider } from './key-provider';
import { KeyRegistry } from './key-registry';
import { createHash } from 'crypto';

describe('KeyProvider (HSM / registry)', () => {
  it('RegistryKeyProvider signs and verifies', () => {
    const reg = new KeyRegistry();
    reg.registerGenerated('w1');
    const p = new RegistryKeyProvider(reg, 'memory');
    const hash = createHash('sha256').update('x').digest('hex');
    const sig = p.sign('w1', hash);
    expect(p.verify(sig, hash)).toBe(true);
    expect(p.exportPublicDirectory()[0].keyId).toBe('w1');
  });

  it('HsmKeyProvider seals keys and never exposes registry privates', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ast-hsm-'));
    const vault = path.join(dir, 'vault.json');
    process.env.AST_HSM_MASTER_KEY = 'ab'.repeat(32);
    const hsm = await HsmKeyProvider.loadOrCreate(vault, ['system', 'token']);
    const hash = createHash('sha256').update('payload').digest('hex');
    const sig = hsm.sign('system', hash);
    expect(hsm.verify(sig, hash)).toBe(true);
    expect(hsm.asKeyRegistry()).toBeUndefined();
    expect(hsm.kind).toBe('hsm');

    // reload from sealed vault
    const hsm2 = await HsmKeyProvider.loadOrCreate(vault, ['system', 'token']);
    expect(hsm2.verify(sig, hash)).toBe(true);
    const bridge = hsm2.toSigningRegistry();
    expect(bridge.hasPrivate('system')).toBe(true);
    expect(bridge.verify(bridge.sign('token', hash), hash)).toBe(true);
  });
});
