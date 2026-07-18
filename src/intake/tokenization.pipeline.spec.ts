import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { TokenizationPipeline } from './tokenization.pipeline';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { globalKillSwitch } from '../hardening/kill-switch';

describe('TokenizationPipeline (hardened 01–10)', () => {
  afterEach(() => {
    globalKillSwitch.release();
  });

  it('runs primary tokenization with ed25519 + L1/L2/L3', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      requireRealCrypto: true,
      verifyEveryN: 3,
    });
    const pipe = new TokenizationPipeline(nc, keys);
    const r = await pipe.runPrimaryTokenization({
      processId: 'AST-DEMO-20260718-e2e1',
      institutionId: 'DEMO',
      valuation: '100.000000000',
      holderId: 'holder-1',
    });
    expect(r.verdict.verified).toBe(1);
    expect(r.mint.amount).toBe('100.000000000');
    expect(r.holderBalance).toBe('100.000000000');
    expect(r.chain.ok).toBe(true);
    expect(r.l1.pass).toBe(true);
    expect(r.l2?.complete).toBe(true);
    expect(r.l3?.pass).toBe(true);
    expect(r.l3?.opinions).toHaveLength(5);
    expect(r.crypto).toBe('ed25519');
    const history = await nc.listByProcessId('AST-DEMO-20260718-e2e1');
    const types = history.map((h) => h.recordType);
    expect(types).toContain('process_open');
    expect(types).toContain('pot_verdict');
    expect(types).toContain('mint_fact');
    expect(types).toContain('commission_settled');
    // real crypto on tip record
    const tip = await nc.getByHeight(r.tip!.height);
    expect(tip?.signatures[0]?.algorithm).toBe('ed25519');
  });

  it('refuses mint path when pot would fail (not allowlisted)', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      requireRealCrypto: true,
    });
    await nc.ensureGenesis('system');
    const pipe = new TokenizationPipeline(nc, keys);
    const proc = await pipe.processes.open({
      processId: 'AST-DEMO-20260718-fail',
      processType: 'primary_tokenization',
      institutionId: 'X',
      valuation: '10.000000000',
      holderId: 'h',
      institutionAllowlisted: false,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    const v = await pipe.pot.verify(proc, ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(0);
  });
});
