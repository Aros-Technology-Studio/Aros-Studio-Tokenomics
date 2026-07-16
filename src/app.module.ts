import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AroscoinModule } from './aroscoin/aroscoin.module';
import { CommissionModule } from './commission/commission.module';
import { CommonModule } from './common/common.module';
import { EmissionModule } from './emission/emission.module';
import { InvariantsModule } from './invariants/invariants.module';
import { NodechainModule } from './nodechain/nodechain.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { PotModule } from './pot/pot.module';
import { ReserveModule } from './reserve/reserve.module';

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
    OrchestratorModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
