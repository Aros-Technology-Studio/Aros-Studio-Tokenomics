import { Test } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AroscoinModule } from '../aroscoin/aroscoin.module';
import { AroscoinService } from '../aroscoin/aroscoin.service';
import { KillSwitchService } from '../common/kill-switch.service';
import { CommissionModule } from '../commission/commission.module';
import { EmissionModule } from '../emission/emission.module';
import { InvariantsModule } from '../invariants/invariants.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { OracleGatewayModule } from '../oracle-gateway/oracle-gateway.module';
import { PotModule } from '../pot/pot.module';
import { ReserveModule } from '../reserve/reserve.module';
import { StateRecordingModule } from '../state-recording/state-recording.module';
import { OrchestratorModule } from './orchestrator.module';
import { OrchestratorService } from './orchestrator.service';

describe('OrchestratorService', () => {
  let orch: OrchestratorService;
  let coin: AroscoinService;
  let kill: KillSwitchService;

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
        OracleGatewayModule,
        StateRecordingModule,
        OrchestratorModule,
      ],
    }).compile();
    orch = moduleRef.get(OrchestratorService);
    coin = moduleRef.get(AroscoinService);
    kill = moduleRef.get(KillSwitchService);
    kill.setActive(false);
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
      { n1: '1', n2: '1', n3: '1' },
    );
    expect(result.verified).toBe(1);
    expect(result.status).toBe('completed');
    expect(result.claimId).toBeDefined();
    expect(parseFloat(coin.balanceOf('holder-1'))).toBe(100);
    expect(orch.getProcess(processId)?.status).toBe('completed');
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

  it('blocks new processes when kill switch active', () => {
    kill.setActive(true);
    expect(() =>
      orch.startProcess({
        institutionCode: 'DEMO',
        idempotencyKey: 'k',
        institutionalValuation: '1',
        currency: 'GEL',
        assetType: 'bond',
        holderId: 'h',
      }),
    ).toThrow(/kill switch/i);
  });

  it('fail-closed without enough real validators (no pad)', () => {
    const { processId } = orch.startProcess({
      institutionCode: 'DEMO',
      idempotencyKey: 'few-val',
      institutionalValuation: '10',
      currency: 'GEL',
      assetType: 'bond',
      holderId: 'h',
    });
    expect(() =>
      orch.runFromPot(
        processId,
        { P1: true, P2: true, P3: true, P4: true },
        { only1: '1' },
      ),
    ).toThrow(/INSUFFICIENT_VALIDATORS|active confirmers/i);
  });
});
