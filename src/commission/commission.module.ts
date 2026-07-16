import { Module } from '@nestjs/common';
import { NodechainModule } from '../nodechain/nodechain.module';
import { NodeReputationModule } from '../node-reputation/node-reputation.module';
import { PotModule } from '../pot/pot.module';
import { ReserveModule } from '../reserve/reserve.module';
import { CommissionService } from './commission.service';

@Module({
  imports: [PotModule, NodechainModule, ReserveModule, NodeReputationModule],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
