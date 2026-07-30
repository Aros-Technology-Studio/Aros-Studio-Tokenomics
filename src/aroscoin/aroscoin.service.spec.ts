import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { TokenService } from '../token/token.service';
import { TokenErrorCode } from '../token/errors';
import { ARO_DECIMALS, ARO_SYMBOL } from '../token/types';
import { ArosCoinService } from './aroscoin.service';

async function journalOkToEmit(nc: NodechainService, processId: string): Promise<number> {
  await nc.append({
    clientRecordId: `pot-evidence:${processId}`,
    recordType: 'pot_evidence',
    processId,
    payload: {
      processId,
      stagesCompleted: ['opened', 'documents', 'encoded'],
    },
    writerId: 'pot',
    writerRole: 'pot',
  });
  const v = await nc.append({
    clientRecordId: `pot-verdict:${processId}`,
    recordType: 'pot_verdict',
    processId,
    payload: {
      verified: 1,
      final: true,
      criteriaResult: { P1: true, P2: true, P3: true, P4: true },
      okToEmit: true,
    },
    writerId: 'pot',
    writerRole: 'pot',
  });
  return v.height;
}

describe('ArosCoinService (canonical ARO surface)', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const token = new TokenService(nc);
    const coin = new ArosCoinService(nc, token);
    return { nc, token, coin };
  }

  it('exposes ARO metadata (symbol + 9 decimals)', async () => {
    const { coin } = await setup();
    expect(coin.symbol()).toBe(ARO_SYMBOL);
    expect(coin.symbol()).toBe('ARO');
    expect(coin.decimals()).toBe(ARO_DECIMALS);
    expect(coin.decimals()).toBe(9);
  });

  it('shares TokenService when injected', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const token = new TokenService(nc);
    const coin = new ArosCoinService(nc, token);
    expect(coin.token).toBe(token);
  });

  it('rejects free mint (no journal ok-to-emit / potVerified=0)', async () => {
    const { coin } = await setup();
    await expect(
      coin.mintAfterPot({
        processId: 'AST-ARO-20260730-freemint1',
        holderId: 'h1',
        amount: '1.000000000',
        potVerified: 1,
        potLedgerHeight: 1,
      }),
    ).rejects.toMatchObject({ code: TokenErrorCode.MINT_WITHOUT_POT });

    await expect(
      coin.mintAfterPot({
        processId: 'AST-ARO-20260730-freemint2',
        holderId: 'h1',
        amount: '1.000000000',
        potVerified: 0,
        potLedgerHeight: 1,
      }),
    ).rejects.toMatchObject({ code: TokenErrorCode.MINT_WITHOUT_POT });

    expect(coin.totalSupply()).toBe('0.000000000');
    expect(coin.balanceOf('h1')).toBe('0.000000000');
  });

  it('mints after PoT via ArosCoin surface and updates balances', async () => {
    const { coin, nc } = await setup();
    const processId = 'AST-ARO-20260730-mintok01';
    const h = await journalOkToEmit(nc, processId);
    const m = await coin.mintAfterPot({
      processId,
      holderId: 'holder-a',
      amount: '25.500000000',
      potVerified: 1,
      potLedgerHeight: h,
    });
    expect(m.amount).toBe('25.500000000');
    expect(coin.balanceOf('holder-a')).toBe('25.500000000');
    expect(coin.totalSupply()).toBe('25.500000000');
    expect(coin.snapshot().totalSupply).toBe('25.500000000');
  });

  it('burns and transfers through the same surface (PoT-gated transfer)', async () => {
    const { coin, nc } = await setup();
    const mintPid = 'AST-ARO-20260730-mintxfer1';
    const h = await journalOkToEmit(nc, mintPid);
    await coin.mintAfterPot({
      processId: mintPid,
      holderId: 'alice',
      amount: '10.000000000',
      potVerified: 1,
      potLedgerHeight: h,
    });

    const burn = await coin.burn({
      processId: mintPid,
      holderId: 'alice',
      amount: '2.000000000',
    });
    expect(burn.amount).toBe('2.000000000');
    expect(coin.balanceOf('alice')).toBe('8.000000000');
    expect(coin.totalSupply()).toBe('8.000000000');

    const xferPid = 'AST-ARO-20260730-xfer0001';
    const hx = await journalOkToEmit(nc, xferPid);
    await coin.transferAfterPot({
      processId: xferPid,
      fromHolderId: 'alice',
      toHolderId: 'bob',
      amount: '3.000000000',
      potVerified: 1,
      potLedgerHeight: hx,
    });
    expect(coin.balanceOf('alice')).toBe('5.000000000');
    expect(coin.balanceOf('bob')).toBe('3.000000000');
    expect(coin.totalSupply()).toBe('8.000000000');
  });

  it('revalues after PoT (I9 pro-rata surface)', async () => {
    const { coin, nc } = await setup();
    const mintPid = 'AST-ARO-20260730-mintreval';
    const h = await journalOkToEmit(nc, mintPid);
    await coin.mintAfterPot({
      processId: mintPid,
      holderId: 'h1',
      amount: '100.000000000',
      potVerified: 1,
      potLedgerHeight: h,
    });
    const revalPid = 'AST-ARO-20260730-reval001';
    const hr = await journalOkToEmit(nc, revalPid);
    const r = await coin.revalueAfterPot({
      processId: revalPid,
      previousValue: '100.000000000',
      newValue: '200.000000000',
      potVerified: 1,
      potLedgerHeight: hr,
    });
    expect(r.newValue).toBe('200.000000000');
    expect(coin.totalSupply()).toBe('200.000000000');
    expect(coin.balanceOf('h1')).toBe('200.000000000');
  });

  it('hydrates balances from journal after memory loss', async () => {
    const keys = bootstrapPipelineKeys();
    const store = new MemoryJournalStore();
    const nc1 = new NodechainService(store, { keys });
    await nc1.ensureGenesis('system');
    const coin1 = new ArosCoinService(nc1);
    const processId = 'AST-ARO-20260730-hydrate1';
    const h = await journalOkToEmit(nc1, processId);
    await coin1.mintAfterPot({
      processId,
      holderId: 'h1',
      amount: '7.000000000',
      potVerified: 1,
      potLedgerHeight: h,
    });

    const nc2 = new NodechainService(store, { keys });
    const coin2 = new ArosCoinService(nc2);
    expect(coin2.balanceOf('h1')).toBe('0.000000000');
    await coin2.hydrateFromJournal();
    expect(coin2.balanceOf('h1')).toBe('7.000000000');
    expect(coin2.totalSupply()).toBe('7.000000000');
  });
});
