import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { TokenService } from './token.service';
import { TokenError, TokenErrorCode } from './errors';

describe('TokenService (layer 05 deep)', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    return { nc, token: new TokenService(nc), keys };
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
    ).rejects.toMatchObject({ code: TokenErrorCode.MINT_WITHOUT_POT });
  });

  it('prevents double mint per process via journal', async () => {
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
    ).rejects.toMatchObject({ code: TokenErrorCode.DOUBLE_MINT });
    expect(token.balanceOf('h1')).toBe('10.000000000');
    expect(token.totalSupply()).toBe('10.000000000');
  });

  it('transfers only after pot', async () => {
    const { token } = await setup();
    await token.mintAfterPot({
      processId: 'mint-t',
      holderId: 'a',
      amount: '20.000000000',
      potVerified: 1,
      potLedgerHeight: 1,
    });
    await expect(
      token.transferAfterPot({
        processId: 'xfer-1',
        fromHolderId: 'a',
        toHolderId: 'b',
        amount: '5.000000000',
        potVerified: 0,
        potLedgerHeight: 2,
      }),
    ).rejects.toBeInstanceOf(TokenError);

    const t = await token.transferAfterPot({
      processId: 'xfer-2',
      fromHolderId: 'a',
      toHolderId: 'b',
      amount: '5.000000000',
      potVerified: 1,
      potLedgerHeight: 2,
    });
    expect(token.balanceOf('a')).toBe('15.000000000');
    expect(token.balanceOf('b')).toBe('5.000000000');
    expect(t.amount).toBe('5.000000000');
  });

  it('revalues pro-rata on value increase', async () => {
    const { token } = await setup();
    await token.mintAfterPot({
      processId: 'm1',
      holderId: 'a',
      amount: '40.000000000',
      potVerified: 1,
      potLedgerHeight: 1,
    });
    await token.mintAfterPot({
      processId: 'm2',
      holderId: 'b',
      amount: '60.000000000',
      potVerified: 1,
      potLedgerHeight: 2,
    });
    const r = await token.revalueAfterPot({
      processId: 'reval-1',
      previousValue: '100.000000000',
      newValue: '200.000000000',
      potVerified: 1,
      potLedgerHeight: 3,
    });
    expect(r.supplyAfter).toBe('200.000000000');
    expect(token.balanceOf('a')).toBe('80.000000000');
    expect(token.balanceOf('b')).toBe('120.000000000');
  });

  it('hydrates balances from journal', async () => {
    const { nc, token } = await setup();
    await token.mintAfterPot({
      processId: 'mh',
      holderId: 'h',
      amount: '7.000000000',
      potVerified: 1,
      potLedgerHeight: 1,
    });
    const token2 = new TokenService(nc);
    await token2.hydrateFromJournal();
    expect(token2.balanceOf('h')).toBe('7.000000000');
    expect(token2.totalSupply()).toBe('7.000000000');
  });

  it('burns and journals burn_fact', async () => {
    const { token, nc } = await setup();
    await token.mintAfterPot({
      processId: 'mb',
      holderId: 'h',
      amount: '10.000000000',
      potVerified: 1,
      potLedgerHeight: 1,
    });
    await token.burn({ processId: 'burn-p', holderId: 'h', amount: '3.000000000' });
    expect(token.balanceOf('h')).toBe('7.000000000');
    const rows = await nc.listByProcessId('burn-p');
    expect(rows.some((r) => r.recordType === 'burn_fact')).toBe(true);
  });
});
