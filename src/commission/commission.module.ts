import { Module } from '@nestjs/common';
import { NodechainModule } from '../nodechain/nodechain.module';
import { PotModule } from '../pot/pot.module';
import { ReserveModule } from '../reserve/reserve.module';
import { CommissionService } from './commission.service';

@Module({
  imports: [PotModule, NodechainModule, ReserveModule],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
