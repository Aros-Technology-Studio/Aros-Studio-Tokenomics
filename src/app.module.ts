import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AllSeeingEyeModule } from './all-seeing-eye/all-seeing-eye.module';
import { AroscoinModule } from './aroscoin/aroscoin.module';
import { CommissionModule } from './commission/commission.module';
import { CommonModule } from './common/common.module';
import { CoreApiModule } from './core-api/core-api.module';
import { EmissionModule } from './emission/emission.module';
import { InvariantsModule } from './invariants/invariants.module';
import { NodeReputationModule } from './node-reputation/node-reputation.module';
import { NodechainModule } from './nodechain/nodechain.module';
import { NodesModule } from './nodes/nodes.module';
import { OracleGatewayModule } from './oracle-gateway/oracle-gateway.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { PartialReleaseModule } from './partial-release/partial-release.module';
import { PotModule } from './pot/pot.module';
import { ReleaseDaemonModule } from './release-daemon/release-daemon.module';
import { ReleaseModule } from './release/release.module';
import { ReserveModule } from './reserve/reserve.module';
import { VelocityTrackerModule } from './velocity-tracker/velocity-tracker.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CommonModule,
    InvariantsModule,
    NodechainModule,
    PotModule,
    EmissionModule,
    ReserveModule,
    AroscoinModule,
    CommissionModule,
    NodesModule,
    NodeReputationModule,
    AllSeeingEyeModule,
    VelocityTrackerModule,
    ReleaseModule,
    ReleaseDaemonModule,
    OracleGatewayModule,
    OrchestratorModule,
    PartialReleaseModule,
    CoreApiModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
