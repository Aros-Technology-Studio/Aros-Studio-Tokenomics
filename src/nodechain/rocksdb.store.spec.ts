import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { RocksDbJournalStore } from './rocksdb.store';
import { NodechainService } from './nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';

describe('RocksDbJournalStore', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-rocks-'));
  });

  afterEach(async () => {
    // best-effort cleanup
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('persists genesis and first record across reopen', async () => {
    const keys = bootstrapPipelineKeys();
    const store1 = new RocksDbJournalStore(dir);
    const nc1 = new NodechainService(store1, { keys });
    await nc1.ensureGenesis('system');
    await nc1.append({
      clientRecordId: 'r1',
      recordType: 'system_boot',
      payload: { n: 1 },
      writerId: 'system',
      writerRole: 'system' });
    await store1.close();

    const store2 = new RocksDbJournalStore(dir);
    const nc2 = new NodechainService(store2, { keys });
    const tip = await nc2.getTip();
    expect(tip?.height).toBe(1);
    const v = await nc2.verifyChain();
    expect(v.ok).toBe(true);
    await store2.close();
  });
});
