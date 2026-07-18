import { OrchestratorService } from './orchestrator.service';
import { OrchestratorErrorCode } from './errors';
import { globalKillSwitch } from '../hardening/kill-switch';

describe('OrchestratorService (sole-entry happy path)', () => {
  afterEach(() => {
    globalKillSwitch.release();
  });

  it('runs primary valuation → PoT → emission → commission 70/30 → reserveIndex', async () => {
    const orch = OrchestratorService.createInMemory();
    const r = await orch.runPrimary({
      processId: 'AST-DEMO-20260719-orch1',
      institutionId: 'DEMO',
      valuation: '1000.000000000',
      holderId: 'holder-1',
      idempotencyKey: 'idem-orch-primary-001',
      assetId: 'asset-orch-1',
      feeRate: 0.0015,
    });

    expect(r.verdict.verified).toBe(1);
    expect(r.okToEmit.okToEmit).toBe(true);
    expect(r.emission.mode).toBe('primary_valuation');
    expect(r.mint.amount).toBe('1000.000000000');
    expect(r.holderBalance).toBe('1000.000000000');
    expect(r.aroscoin.totalSupply).toBe('1000.000000000');
    expect(r.aroscoin.symbol).toBe('ARO');

    // post-factum commission
    expect(r.settlement.fee).toBe('1.500000000');
    expect(r.settlement.nodesPool).toBe('1.050000000');
    expect(r.settlement.astShare).toBe('0.450000000');
    expect(r.settlement.split.nodes).toBeCloseTo(0.7);

    // own-funds reserve + index
    expect(r.reserve.ownBalance).toBe('0.450000000');
    expect(r.reserveIndex).toBeGreaterThan(0);
    expect(orch.reserve.snapshot().reserveIndex).toBe(r.reserveIndex);

    expect(r.chain.ok).toBe(true);
    expect(r.steps.map((s) => s.step)).toEqual(
      expect.arrayContaining([
        'start',
        'l1',
        'l2',
        'process_open',
        'pot',
        'emission',
        'settlement',
        'reserve',
        'state',
        'end',
      ]),
    );

    const history = await orch.nodechain.listByProcessId(r.processId);
    const types = history.map((h) => h.recordType);
    expect(types).toContain('process_open');
    expect(types).toContain('pot_verdict');
    expect(types).toContain('mint_fact');
    expect(types).toContain('emission_fact');
    expect(types).toContain('commission_settled');
    expect(types).toContain('reserve_accrual');
    expect(types).toContain('orchestrator_step');
  });

  it('requires idempotencyKey', async () => {
    const orch = OrchestratorService.createInMemory();
    await expect(
      orch.runPrimary({
        institutionId: 'DEMO',
        valuation: '10.000000000',
        holderId: 'h',
        idempotencyKey: 'short',
      }),
    ).rejects.toMatchObject({ code: OrchestratorErrorCode.IDEMPOTENCY_REQUIRED });
  });

  it('rejects reused idempotencyKey', async () => {
    const orch = OrchestratorService.createInMemory();
    await orch.runPrimary({
      processId: 'AST-DEMO-20260719-orch2',
      institutionId: 'DEMO',
      valuation: '50.000000000',
      holderId: 'h',
      idempotencyKey: 'idem-reuse-key-001',
    });
    await expect(
      orch.runPrimary({
        processId: 'AST-DEMO-20260719-orch3',
        institutionId: 'DEMO',
        valuation: '50.000000000',
        holderId: 'h',
        idempotencyKey: 'idem-reuse-key-001',
      }),
    ).rejects.toMatchObject({ code: OrchestratorErrorCode.IDEMPOTENCY_CONFLICT });
  });
});
