import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { TokenService } from './token.service';

describe('TokenService (layer 05)', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      requireRealCrypto: true,
    });
    await nc.ensureGenesis('system');
    return { nc, token: new TokenService(nc) };
  }

  it('mints only after pot verified=1', async () => {
    const { token } = await setup();
    await expect(
      token.mintAfterPot({
        processId: 'p1',
        holderId: 'h1',
        amount: '10.000000000',
        potVerified: 0,
        potLedgerHeight: 1,
      }),
    ).rejects.toThrow(/pot verified/);
  });

  it('prevents double mint per process', async () => {
    const { token } = await setup();
    await token.mintAfterPot({
      processId: 'p2',
      holderId: 'h1',
      amount: '10.000000000',
      potVerified: 1,
      potLedgerHeight: 2,
    });
    await expect(
      token.mintAfterPot({
        processId: 'p2',
        holderId: 'h1',
        amount: '10.000000000',
        potVerified: 1,
        potLedgerHeight: 3,
      }),
    ).rejects.toThrow(/double mint/);
    expect(token.balanceOf('h1')).toBe('10.000000000');
  });
});
