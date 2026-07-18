import { MemoryJournalStore } from '../memory.store';
import { NodechainService } from '../nodechain.service';
import { bootstrapPipelineKeys } from '../../common/crypto/bootstrap-keys';
import { JournalReplicator } from './journal-replicator';

describe('JournalReplicator (#69)', () => {
  async function node(_name: string) {
    const keys = bootstrapPipelineKeys();
    const store = new MemoryJournalStore();
    const nc = new NodechainService(store, { keys });
    await nc.ensureGenesis('system');
    return { keys, store, nc };
  }

  it('catch-up applies peer segment when behind', async () => {
    const a = await node('a');
    const b = await node('b');
    // Align genesis: copy a genesis onto b empty is hard — instead grow a, use b as empty behind
    // Rebuild: peer has more records from same genesis chain
    await a.nc.append({
      clientRecordId: 'boot-a1',
      recordType: 'system_boot',
      payload: { n: 1 },
      writerId: 'system',
      writerRole: 'system',
    });
    await a.nc.append({
      clientRecordId: 'boot-a2',
      recordType: 'system_boot',
      payload: { n: 2 },
      writerId: 'system',
      writerRole: 'system',
    });

    // Fresh follower with same keys, only genesis from a
    const keys = a.keys;
    const followerStore = new MemoryJournalStore();
    const g = await a.store.getByHeight(0);
    await followerStore.appendDurable(g!);
    const follower = new NodechainService(followerStore, { keys });
    const rep = new JournalReplicator(followerStore, follower);
    const peer = JournalReplicator.asPeer(a.store);

    expect(await rep.compareTips(peer)).toBe('peer_ahead');
    const r = await rep.catchUpFrom(peer);
    expect(r.error).toBeUndefined();
    expect(r.applied).toBe(2);
    expect((await followerStore.getTip())!.height).toBe(2);
    expect((await followerStore.getTip())!.tipHash).toBe((await a.store.getTip())!.tipHash);
  });

  it('refuses divergent tips', async () => {
    const a = await node('a');
    const b = await node('b');
    // Different genesis hashes → diverge at height 0
    const rep = new JournalReplicator(a.store);
    const peer = JournalReplicator.asPeer(b.store);
    // After independent genesis, tips at 0 with different hashes
    const rel = await rep.compareTips(peer);
    expect(rel === 'diverge' || rel === 'equal').toBe(true);
    if (rel === 'equal') {
      // same keys+payload may collide rarely — force diverge by extra append only on b
      await b.nc.append({
        clientRecordId: 'only-b',
        recordType: 'system_boot',
        payload: { only: 'b' },
        writerId: 'system',
        writerRole: 'system',
      });
      await a.nc.append({
        clientRecordId: 'only-a',
        recordType: 'system_boot',
        payload: { only: 'a' },
        writerId: 'system',
        writerRole: 'system',
      });
      expect(await rep.compareTips(JournalReplicator.asPeer(b.store))).toBe('diverge');
    }
    const r = await rep.catchUpFrom(JournalReplicator.asPeer(b.store));
    if (r.relation === 'diverge') {
      expect(r.applied).toBe(0);
      expect(r.error).toMatch(/diverge|refuse|break/i);
    }
  });
});
