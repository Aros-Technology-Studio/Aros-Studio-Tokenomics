import { Module } from '@nestjs/common';
import { AroscoinModule } from '../aroscoin/aroscoin.module';
import { CommonModule } from '../common/common.module';
import { CommissionModule } from '../commission/commission.module';
import { EmissionModule } from '../emission/emission.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { NodesModule } from '../nodes/nodes.module';
import { OracleGatewayModule } from '../oracle-gateway/oracle-gateway.module';
import { PotModule } from '../pot/pot.module';
import { ReserveModule } from '../reserve/reserve.module';
import { StateRecordingModule } from '../state-recording/state-recording.module';
import { OrchestratorService } from './orchestrator.service';

@Module({
  imports: [
    CommonModule,
    PotModule,
    EmissionModule,
    AroscoinModule,
    CommissionModule,
    ReserveModule,
    NodechainModule,
    NodesModule,
    OracleGatewayModule,
    StateRecordingModule,
  ],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}


