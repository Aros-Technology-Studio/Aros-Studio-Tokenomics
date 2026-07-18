import { CoreProcessesController } from './processes.controller';
import { CorePartialReleaseController } from './partial-release.controller';
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
      undefined,
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

  it('POST /v1/core/partial-release burns and remints', async () => {
    const orch = OrchestratorService.createInMemory();
    const processes = new CoreProcessesController(orch);
    await processes.create(
      {
        valuation: '100.000000000',
        holderId: 'h1',
        hasQualifiedSignature: true,
        processId: 'AST-DEMO-20260719-coremint',
      },
      'idem-core-mint-for-pr',
      'DEMO',
      undefined,
    );
    // Fund reserve for child claim
    await orch.reserve.accrueFromCommission({
      processId: 'AST-DEMO-20260719-corersv',
      astShare: '40.000000000',
      processValuation: '1000.000000000',
    });

    const pr = new CorePartialReleaseController(orch);
    const body = await pr.partialRelease(
      {
        holderId: 'h1',
        releaseAmount: '25.000000000',
        processId: 'AST-DEMO-20260719-corepr1',
        holderApproved: true,
        institutionApproved: true,
      },
      'idem-core-partial-001',
      'DEMO',
    );
    expect(body.status).toBe('completed');
    expect(body.releaseAmount).toBe('25.000000000');
    expect(body.balanceAfter).toBe('75.000000000');
  });
});
