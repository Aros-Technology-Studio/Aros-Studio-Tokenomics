import { Test } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppModule } from '../../src/app.module';
import { AroscoinService } from '../../src/aroscoin/aroscoin.service';
import { KillSwitchService } from '../../src/common/kill-switch.service';
import { NodechainService } from '../../src/nodechain/nodechain.service';
import { OrchestratorService } from '../../src/orchestrator/orchestrator.service';
import { PotService } from '../../src/pot/pot.service';

/**
 * Phase 1–3 vertical slice: start → PoT (write-ahead) → mint → settle.
 */
describe('E2E tokenization flow', () => {
  let orch: OrchestratorService;
  let pot: PotService;
  let coin: AroscoinService;
  let nodechain: NodechainService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), AppModule],
    }).compile();
    orch = mod.get(OrchestratorService);
    pot = mod.get(PotService);
    coin = mod.get(AroscoinService);
    nodechain = mod.get(NodechainService);
    mod.get(KillSwitchService).setActive(false);
  });

  it('completes institutional valuation → PoT → emission → NodeChain', () => {
    const start = orch.startProcess({
      institutionCode: 'BANK',
      idempotencyKey: `e2e-${Date.now()}`,
      institutionalValuation: '250.5',
      currency: 'GEL',
      assetType: 'real_estate',
      holderId: 'inst-holder',
    });

    const done = orch.runFromPot(
      start.processId,
      { P1: true, P2: true, P3: true, P4: true },
      { v1: '1', v2: '1', v3: '1' },
    );

    expect(done.status).toBe('completed');
    expect(done.verified).toBe(1);
    expect(pot.okToEmit(start.processId)).toBe(true);
    expect(pot.verdictHeight(start.processId)).toBeGreaterThan(0);
    expect(parseFloat(coin.balanceOf('inst-holder'))).toBe(250.5);
    expect(nodechain.verifyIntegrity().ok).toBe(true);
    expect(nodechain.getHeight()).toBeGreaterThan(2);
  });
});
