import { Module } from '@nestjs/common';
import { InvariantsModule } from '../invariants/invariants.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { PotService } from './pot.service';

@Module({
  imports: [NodechainModule, InvariantsModule],
  providers: [PotService],
  exports: [PotService],
})
export class PotModule {}
