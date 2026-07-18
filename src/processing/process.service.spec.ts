import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ProcessService } from './process.service';

describe('ProcessService (layer 03)', () => {
  it('opens process and writes process_open + stage', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      requireRealCrypto: true,
    });
    await nc.ensureGenesis('system');
    const proc = new ProcessService(nc);
    const p = await proc.open({
      processId: 'AST-PROC-1',
      processType: 'primary_tokenization',
      institutionId: 'DEMO',
      valuation: '1.000000000',
      holderId: 'h',
      institutionAllowlisted: true,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    expect(p.stage).toBe('awaiting_pot');
    expect(p.payloadHash).toBeTruthy();
    const rows = await nc.listByProcessId('AST-PROC-1');
    expect(rows.map((r) => r.recordType)).toEqual(
      expect.arrayContaining(['process_open', 'process_stage']),
    );
  });
});
