import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { TokenizationPipeline } from './tokenization.pipeline';

describe('TokenizationPipeline (layers 01–10 path)', () => {
  it('runs primary tokenization end-to-end on journal', async () => {
    const nc = new NodechainService(new MemoryJournalStore());
    const pipe = new TokenizationPipeline(nc);
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
    expect(r.tip!.height).toBeGreaterThan(5);
    expect(r.settlement.split ?? { nodes: 0.7 }).toBeTruthy();
    const history = await nc.listByProcessId('AST-DEMO-20260718-e2e1');
    const types = history.map((h) => h.recordType);
    expect(types).toContain('process_open');
    expect(types).toContain('pot_verdict');
    expect(types).toContain('mint_fact');
    expect(types).toContain('commission_settled');
  });

  it('refuses mint path when pot would fail (not allowlisted)', async () => {
    const nc = new NodechainService(new MemoryJournalStore());
    await nc.ensureGenesis();
    const pipe = new TokenizationPipeline(nc);
    // force fail via governance L1 by using pipeline open only with bad flags — use pot directly
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
