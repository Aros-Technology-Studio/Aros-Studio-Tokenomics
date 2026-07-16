import { Test } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AroscoinModule } from '../aroscoin/aroscoin.module';
import { CommissionModule } from '../commission/commission.module';
import { EmissionModule } from '../emission/emission.module';
import { InvariantsModule } from '../invariants/invariants.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { PotModule } from '../pot/pot.module';
import { ReserveModule } from '../reserve/reserve.module';
import { OrchestratorModule } from './orchestrator.module';
import { OrchestratorService } from './orchestrator.service';
import { AroscoinService } from '../aroscoin/aroscoin.service';

describe('OrchestratorService', () => {
  let orch: OrchestratorService;
  let coin: AroscoinService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
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
      ],
    }).compile();
    orch = moduleRef.get(OrchestratorService);
    coin = moduleRef.get(AroscoinService);
  });

  it('runs start → pot → mint → settle happy path', () => {
    const { processId } = orch.startProcess({
      institutionCode: 'DEMO',
      idempotencyKey: 'key-1',
      institutionalValuation: '100',
      currency: 'GEL',
      assetType: 'bond',
      holderId: 'holder-1',
    });
    expect(processId.startsWith('AST-DEMO-')).toBe(true);

    const result = orch.runFromPot(
      processId,
      { P1: true, P2: true, P3: true, P4: true },
      { n1: '1' },
    );
    expect(result.verified).toBe(1);
    expect(result.claimId).toBeDefined();
    expect(parseFloat(coin.balanceOf('holder-1'))).toBe(100);
  });

  it('is idempotent on start', () => {
    const a = orch.startProcess({
      institutionCode: 'DEMO',
      idempotencyKey: 'same',
      institutionalValuation: '10',
      currency: 'GEL',
      assetType: 'bond',
      holderId: 'h',
    });
    const b = orch.startProcess({
      institutionCode: 'DEMO',
      idempotencyKey: 'same',
      institutionalValuation: '10',
      currency: 'GEL',
      assetType: 'bond',
      holderId: 'h',
    });
    expect(a.processId).toBe(b.processId);
  });
});
