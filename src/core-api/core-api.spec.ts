import { CoreProcessesController } from './processes.controller';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { globalKillSwitch } from '../hardening/kill-switch';

describe('Core API processes controller', () => {
  afterEach(() => {
    globalKillSwitch.release();
  });

  it('runs orchestrator on POST /v1/core/processes', async () => {
    const orch = OrchestratorService.createInMemory();
    const ctrl = new CoreProcessesController(orch);

    const body = await ctrl.create(
      {
        valuation: '100.000000000',
        holderId: 'h1',
        hasQualifiedSignature: true,
        documentPackageHash: 'ab'.repeat(32),
        processId: 'AST-DEMO-20260719-coreapi1',
        assetId: 'asset-core-1',
      },
      'idem-core-api-test-001',
      'DEMO',
    );

    expect(body.processId).toBe('AST-DEMO-20260719-coreapi1');
    expect(body.status).toBe('completed');
    expect(body.verdict.verified).toBe(1);
    expect(body.mint.amount).toBe('100.000000000');
    expect(body.reserveIndex).toBeGreaterThanOrEqual(0);

    const status = await ctrl.get('AST-DEMO-20260719-coreapi1', 'DEMO');
    expect(status.potVerified).toBe(1);
    expect(status.mintAmount).toBe('100.000000000');
  });
});
