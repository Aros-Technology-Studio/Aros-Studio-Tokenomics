import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FileJournalStore } from './file.store';
import { NodechainService } from './nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import {
  JournalAtRestCipher,
  isAtRestEnvelope,
  loadOrCreateAtRestKey,
} from '../common/crypto/at-rest';

describe('FileJournalStore encryption at rest', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-file-enc-'));
    delete process.env.AST_JOURNAL_AT_REST_KEY;
  });

  afterEach(() => {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('writes sealed journal lines and reopens with same key', async () => {
    const key = await loadOrCreateAtRestKey(dir);
    const cipher = new JournalAtRestCipher(key);
    const keys = bootstrapPipelineKeys();

    const store1 = new FileJournalStore(dir, cipher);
    const nc1 = new NodechainService(store1, { keys });
    await nc1.ensureGenesis('system');
    await nc1.append({
      clientRecordId: 'enc-1',
      recordType: 'system_boot',
      payload: { secret: 'not-in-plaintext-file' },
      writerId: 'system',
      writerRole: 'system',
    });

    const journalRaw = fs.readFileSync(path.join(dir, 'journal.jsonl'), 'utf8');
    expect(journalRaw).not.toContain('not-in-plaintext-file');
    const firstLine = journalRaw.trim().split('\n')[0];
    expect(isAtRestEnvelope(JSON.parse(firstLine))).toBe(true);

    const store2 = new FileJournalStore(dir, new JournalAtRestCipher(key));
    const nc2 = new NodechainService(store2, { keys });
    const tip = await nc2.getTip();
    expect(tip?.height).toBe(1);
    const rec = await nc2.getByHeight(1);
    expect(rec?.payload?.secret).toBe('not-in-plaintext-file');
    const chain = await nc2.verifyChain();
    expect(chain.ok).toBe(true);
  });
});
