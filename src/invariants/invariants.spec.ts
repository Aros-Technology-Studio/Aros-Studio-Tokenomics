import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import {
  assertI1_poTVerified,
  assertI2_processBound,
  assertI5_noSpeculativeHolding,
  assertI6_ownFundsOnly,
  assertI8_internalCirculation,
  assertI9_proRataEmission,
  assertCriteriaP1P4,
  InvariantError,
  resolveOkToEmit,
} from './index';

describe('invariants I1–I9 (fail-closed)', () => {
  it('I1 rejects verified!=1', () => {
    expect(() => assertI1_poTVerified(0)).toThrow(InvariantError);
    expect(() => assertI1_poTVerified(1)).not.toThrow();
  });

  it('I2 requires valid processId', () => {
    expect(() => assertI2_processBound('p1')).toThrow(InvariantError);
    expect(() => assertI2_processBound('AST-DEMO-20260719-abc123')).not.toThrow();
  });

  it('I5/I6/I8/I9 fail closed', () => {
    expect(() => assertI5_noSpeculativeHolding(true)).toThrow(/I5/);
    expect(() => assertI6_ownFundsOnly(true)).toThrow(/I6/);
    expect(() => assertI8_internalCirculation(false, 'public_cex')).toThrow(/I8/);
    expect(() => assertI8_internalCirculation(false, 'holder')).not.toThrow();
    expect(() => assertI9_proRataEmission(false)).toThrow(/I9/);
  });

  it('criteria P1–P4 all required', () => {
    expect(() =>
      assertCriteriaP1P4({ P1: true, P2: true, P3: true, P4: false }),
    ).toThrow(InvariantError);
    expect(() =>
      assertCriteriaP1P4({ P1: true, P2: true, P3: true, P4: true }),
    ).not.toThrow();
  });

  it('ok-to-emit requires evidence then verdict with P1–P4 on NodeChain', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const processId = 'AST-DEMO-20260719-okemit1';

    await expect(resolveOkToEmit(nc, processId)).rejects.toBeInstanceOf(InvariantError);

    await nc.append({
      clientRecordId: `pot-evidence:${processId}`,
      recordType: 'pot_evidence',
      processId,
      payload: { processId },
      writerId: 'pot',
      writerRole: 'pot',
    });
    await expect(resolveOkToEmit(nc, processId)).rejects.toThrow(/pot_verdict/);

    await nc.append({
      clientRecordId: `pot-verdict:${processId}`,
      recordType: 'pot_verdict',
      processId,
      payload: {
        verified: 1,
        criteriaResult: { P1: true, P2: true, P3: true, P4: true },
      },
      writerId: 'pot',
      writerRole: 'pot',
    });

    const gate = await resolveOkToEmit(nc, processId);
    expect(gate.okToEmit).toBe(true);
    expect(gate.potVerified).toBe(1);
    expect(gate.evidenceHeight).toBeLessThan(gate.potLedgerHeight);
  });

  it('ok-to-emit rejects verified=1 without full criteria', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const processId = 'AST-DEMO-20260719-okemit2';
    await nc.append({
      clientRecordId: `pot-evidence:${processId}`,
      recordType: 'pot_evidence',
      processId,
      payload: {},
      writerId: 'pot',
      writerRole: 'pot',
    });
    await nc.append({
      clientRecordId: `pot-verdict:${processId}`,
      recordType: 'pot_verdict',
      processId,
      payload: {
        verified: 1,
        criteriaResult: { P1: true, P2: false, P3: true, P4: true },
      },
      writerId: 'pot',
      writerRole: 'pot',
    });
    await expect(resolveOkToEmit(nc, processId)).rejects.toThrow(/P1–P4/);
  });
});
