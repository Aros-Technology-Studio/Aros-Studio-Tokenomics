import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { CommonModule } from './common/common.module';
import { InvariantsModule } from './invariants/invariants.module';
import { NodechainModule } from './nodechain/nodechain.module';
import { PotModule } from './pot/pot.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    CommonModule,
    InvariantsModule,
    NodechainModule,
    PotModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
