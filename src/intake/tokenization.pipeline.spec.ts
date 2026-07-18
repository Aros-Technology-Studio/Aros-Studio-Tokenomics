import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { TokenizationPipeline } from './tokenization.pipeline';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { globalKillSwitch } from '../hardening/kill-switch';
import { makeProcessId, isValidProcessId } from './process-id';
import { hashDocumentPackage } from './document-package';

describe('TokenizationPipeline (layer 10 deep)', () => {
  afterEach(() => {
    globalKillSwitch.release();
  });

  function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys, verifyEveryN: 3 });
    const pipe = new TokenizationPipeline(nc, keys);
    return { nc, pipe, keys };
  }

  it('primary tokenization end-to-end with asset registry + token snapshot', async () => {
    const { nc, pipe } = setup();
    const r = await pipe.runPrimaryTokenization({
      processId: 'AST-DEMO-20260718-e2e1',
      institutionId: 'DEMO',
      valuation: '100.000000000',
      holderId: 'holder-1',
      assetId: 'asset-demo-1',
      documentPackage: {
        documents: [{ name: 'valuation.pdf', contentHash: 'aa'.repeat(32) }],
        hasQualifiedSignature: true,
        signerId: 'inst-signer',
      },
    });
    expect(r.verdict.verified).toBe(1);
    expect(r.mint.amount).toBe('100.000000000');
    expect(r.holderBalance).toBe('100.000000000');
    expect(r.asset?.assetId).toBe('asset-demo-1');
    expect(r.asset?.currentValue).toBe('100.000000000');
    expect(r.tokenSnapshot.totalSupply).toBe('100.000000000');
    expect(r.documentPackageHash).toHaveLength(64);
    expect(r.chain.ok).toBe(true);

    const history = await nc.listByProcessId('AST-DEMO-20260718-e2e1');
    const types = history.map((h) => h.recordType);
    expect(types).toContain('process_open');
    expect(types).toContain('pot_verdict');
    expect(types).toContain('mint_fact');
    expect(types).toContain('commission_settled');
  });

  it('revaluation doubles supply pro-rata', async () => {
    const { pipe } = setup();
    await pipe.runPrimaryTokenization({
      processId: 'AST-DEMO-20260718-rv1',
      institutionId: 'DEMO',
      valuation: '100.000000000',
      holderId: 'h1',
      assetId: 'asset-rv',
    });
    const rv = await pipe.runRevaluation({
      assetId: 'asset-rv',
      newValue: '200.000000000',
      processId: 'AST-DEMO-20260718-rv2',
    });
    expect(rv.verdict.verified).toBe(1);
    expect(rv.reval.supplyAfter).toBe('200.000000000');
    expect(pipe.token.balanceOf('h1')).toBe('200.000000000');
    expect(pipe.assets.get('asset-rv')?.currentValue).toBe('200.000000000');
  });

  it('ownership transfer moves balances after pot', async () => {
    const { pipe } = setup();
    await pipe.runPrimaryTokenization({
      processId: 'AST-DEMO-20260718-tr1',
      institutionId: 'DEMO',
      valuation: '50.000000000',
      holderId: 'alice',
      assetId: 'asset-tr',
    });
    const tr = await pipe.runOwnershipTransfer({
      assetId: 'asset-tr',
      fromHolderId: 'alice',
      toHolderId: 'bob',
      amount: '20.000000000',
      processId: 'AST-DEMO-20260718-tr2',
    });
    expect(tr.verdict.verified).toBe(1);
    expect(pipe.token.balanceOf('alice')).toBe('30.000000000');
    expect(pipe.token.balanceOf('bob')).toBe('20.000000000');
    expect(pipe.assets.get('asset-tr')?.holderIds).toContain('bob');
  });

  it('rejects pot when not allowlisted', async () => {
    const { pipe, keys, nc } = setup();
    await nc.ensureGenesis('system');
    const proc = await pipe.processes.open({
      processId: 'AST-DEMO-20260718-fail01',
      processType: 'primary_tokenization',
      institutionId: 'X',
      valuation: '10.000000000',
      holderId: 'h',
      institutionAllowlisted: false,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    const v = await pipe.pot.verify({
      process: proc,
      confirmers: ['v1', 'v2', 'v3'],
      validatorIds: ['v1', 'v2', 'v3'],
      keys,
    });
    expect(v.verified).toBe(0);
  });

  it('makeProcessId is valid', () => {
    const id = makeProcessId('Demo-Bank');
    expect(isValidProcessId(id)).toBe(true);
  });

  it('document package hash is stable', () => {
    const pkg = {
      documents: [{ name: 'a.pdf', contentHash: '11'.repeat(32) }],
      hasQualifiedSignature: true as const,
    };
    expect(hashDocumentPackage(pkg)).toBe(hashDocumentPackage(pkg));
  });
});
