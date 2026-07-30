import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  JournalAtRestCipher,
  generateMasterKeyHex,
  isAtRestEnvelope,
  loadOrCreateAtRestKey,
  masterKeyFromHex,
} from './at-rest';

describe('JournalAtRestCipher', () => {
  it('round-trips payload', () => {
    const key = masterKeyFromHex(generateMasterKeyHex());
    const c = new JournalAtRestCipher(key);
    const sealed = c.sealUtf8(JSON.stringify({ height: 1, hello: 'world' }));
    const env = JSON.parse(sealed);
    expect(isAtRestEnvelope(env)).toBe(true);
    expect(sealed).not.toContain('hello');
    const opened = c.openUtf8(sealed);
    expect(JSON.parse(opened)).toEqual({ height: 1, hello: 'world' });
  });

  it('accepts legacy plaintext JSON', () => {
    const key = masterKeyFromHex(generateMasterKeyHex());
    const c = new JournalAtRestCipher(key);
    const legacy = JSON.stringify({ height: 0, recordType: 'genesis' });
    expect(c.decode<{ height: number }>(legacy).height).toBe(0);
  });

  it('loadOrCreateAtRestKey persists and reloads', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-atrest-'));
    try {
      delete process.env.AST_JOURNAL_AT_REST_KEY;
      const k1 = await loadOrCreateAtRestKey(dir);
      const k2 = await loadOrCreateAtRestKey(dir);
      expect(k1.equals(k2)).toBe(true);
      expect(fs.existsSync(path.join(dir, 'at-rest.key'))).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
