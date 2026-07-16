import { Test } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AroscoinModule } from '../aroscoin/aroscoin.module';
import { AroscoinService } from '../aroscoin/aroscoin.service';
import { CommissionModule } from '../commission/commission.module';
import { EmissionModule } from '../emission/emission.module';
import { InvariantsModule } from '../invariants/invariants.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { PotModule } from '../pot/pot.module';
import { ReleaseModule } from '../release/release.module';
import { ReserveModule } from '../reserve/reserve.module';
import { ReserveService } from '../reserve/reserve.service';
import { PartialReleaseModule } from './partial-release.module';
import { PartialReleaseService } from './partial-release.service';

describe('PartialReleaseService', () => {
  let partial: PartialReleaseService;
  let orch: OrchestratorService;
  let coin: AroscoinService;
  let reserve: ReserveService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        InvariantsModule,
        NodechainModule,
        PotModule,
        EmissionModule,
        AroscoinModule,
        ReserveModule,
        CommissionModule,
        OrchestratorModule,
        ReleaseModule,
        PartialReleaseModule,
      ],
    }).compile();
    partial = mod.get(PartialReleaseService);
    orch = mod.get(OrchestratorService);
    coin = mod.get(AroscoinService);
    reserve = mod.get(ReserveService);

    // Seed holder with ARO via full process
    const { processId } = orch.startProcess({
      institutionCode: 'DEMO',
      idempotencyKey: 'seed-1',
      institutionalValuation: '100',
      currency: 'GEL',
      assetType: 'bond',
      holderId: 'holder-1',
    });
    orch.runFromPot(
      processId,
      { P1: true, P2: true, P3: true, P4: true },
      { n1: '1', n2: '1', n3: '1' },
    );
    reserve.credit('AST_OWN', 'ASSET', '100');
    reserve.lock('AST_OWN', 'ASSET', '50');
  });

  it('requires institutional approval and dust', () => {
    expect(() =>
      partial.request({
        holderId: 'holder-1',
        institutionCode: 'DEMO',
        institutionalApproval: false,
        amountAro: '1',
        sourceClaimId: 'c',
        idempotencyKey: 'x',
        institutionalValuation: '1',
        currency: 'GEL',
      }),
    ).toThrow(/approval/i);
  });

  it('runs full process burn+child+remint', () => {
    const balBefore = parseFloat(coin.balanceOf('holder-1'));
    expect(balBefore).toBe(100);

    // Need an existing claim id from seed mint — use claim-${processId} pattern from orch
    // After seed, claim is claim-${processId}
    const r = partial.request({
      holderId: 'holder-1',
      institutionCode: 'DEMO',
      institutionalApproval: true,
      amountAro: '10',
      sourceClaimId: 'any-source', // burn will check balance not claim inventory in skeleton
      idempotencyKey: 'pr-1',
      institutionalValuation: '10',
      currency: 'GEL',
    });

    expect(r.status).toBe('completed');
    expect(r.newClaimId).toBeDefined();
    expect(reserve.getChildren().length).toBeGreaterThanOrEqual(1);
    // net: burn 10 remint 10 → balance same
    expect(parseFloat(coin.balanceOf('holder-1'))).toBe(100);
  });
});
