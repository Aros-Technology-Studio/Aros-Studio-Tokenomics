import { Module } from '@nestjs/common';
import { AroscoinModule } from '../aroscoin/aroscoin.module';
import { CommissionModule } from '../commission/commission.module';
import { EmissionModule } from '../emission/emission.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { OracleGatewayModule } from '../oracle-gateway/oracle-gateway.module';
import { PotModule } from '../pot/pot.module';
import { ReserveModule } from '../reserve/reserve.module';
import { OrchestratorService } from './orchestrator.service';

@Module({
  imports: [
    PotModule,
    EmissionModule,
    AroscoinModule,
    CommissionModule,
    ReserveModule,
    NodechainModule,
    OracleGatewayModule,
  ],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}

