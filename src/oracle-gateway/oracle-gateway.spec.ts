import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { OracleGatewayService } from './oracle-gateway.service';
import { OracleError } from './errors';

describe('OracleGatewayService (multi-oracle fail-closed)', () => {
  function setup() {
    const keys = bootstrapPipelineKeys();
    keys.registerGenerated('oracle-a');
    keys.registerGenerated('oracle-b');
    keys.registerGenerated('oracle-c');
    const gw = new OracleGatewayService(keys, undefined, { minOracles: 2 });
    gw.registerMany(['oracle-a', 'oracle-b', 'oracle-c']);
    return { keys, gw };
  }

  it('accepts M-of-N valid signatures', () => {
    const { gw } = setup();
    const processId = 'AST-DEMO-20260719-orc1';
    const asOfUtc = new Date().toISOString();
    const a = gw.signAttestation('oracle-a', {
      processId,
      observedValue: '100.0',
      asOfUtc,
    });
    const b = gw.signAttestation('oracle-b', {
      processId,
      observedValue: '100.0',
      asOfUtc,
    });
    const r = gw.require({ processId, attestations: [a, b] });
    expect(r.ok).toBe(true);
    expect(r.validOracleIds).toEqual(['oracle-a', 'oracle-b']);
  });

  it('fail-closed on single oracle when min=2', () => {
    const { gw } = setup();
    const processId = 'AST-DEMO-20260719-orc2';
    const a = gw.signAttestation('oracle-a', {
      processId,
      asOfUtc: new Date().toISOString(),
    });
    expect(() => gw.require({ processId, attestations: [a] })).toThrow(OracleError);
    const soft = gw.verify({ processId, attestations: [a] });
    expect(soft.ok).toBe(false);
    expect(soft.reasonCodes).toContain('ORACLE_FAIL_CLOSED');
  });

  it('fail-closed on bad signature', () => {
    const { gw } = setup();
    const processId = 'AST-DEMO-20260719-orc3';
    const a = gw.signAttestation('oracle-a', {
      processId,
      asOfUtc: new Date().toISOString(),
    });
    const b = gw.signAttestation('oracle-b', {
      processId,
      asOfUtc: new Date().toISOString(),
    });
    b.signature = '00'.repeat(64);
    const r = gw.verify({ processId, attestations: [a, b] });
    expect(r.ok).toBe(false);
    expect(r.invalidOracleIds).toContain('oracle-b');
  });

  it('journals oracle_report', async () => {
    const keys = bootstrapPipelineKeys();
    keys.registerGenerated('oracle-a');
    keys.registerGenerated('oracle-b');
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const gw = new OracleGatewayService(keys, nc, { minOracles: 2 });
    gw.registerMany(['oracle-a', 'oracle-b']);
    const processId = 'AST-DEMO-20260719-orc4';
    const asOfUtc = new Date().toISOString();
    const pkg = {
      processId,
      attestations: [
        gw.signAttestation('oracle-a', { processId, asOfUtc }),
        gw.signAttestation('oracle-b', { processId, asOfUtc }),
      ],
    };
    const r = gw.require(pkg);
    await gw.journalReport(processId, r);
    const rows = await nc.listByProcessId(processId);
    expect(rows.some((x) => x.recordType === 'oracle_report')).toBe(true);
  });
});
