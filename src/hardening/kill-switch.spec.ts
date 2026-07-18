import { KillSwitch } from './kill-switch';
import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { globalKillSwitch } from './kill-switch';

describe('kill-switch', () => {
  afterEach(() => {
    globalKillSwitch.release();
  });

  it('blocks appends when engaged', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      requireRealCrypto: true,
    });
    await nc.ensureGenesis('system');
    globalKillSwitch.engage('test');
    await expect(
      nc.append({
        recordType: 'system_boot',
        payload: {},
        writerId: 'system',
        writerRole: 'system',
      }),
    ).rejects.toMatchObject({ code: 'E_READ_ONLY' });
  });

  it('local switch engage/release', () => {
    const k = new KillSwitch();
    k.engage('x');
    expect(k.isEngaged()).toBe(true);
    expect(() => k.assertWritable()).toThrow(/KILL_SWITCH/);
    k.release();
    expect(k.isEngaged()).toBe(false);
  });
});
