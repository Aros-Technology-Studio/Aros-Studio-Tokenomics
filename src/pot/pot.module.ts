import { Module } from '@nestjs/common';
import { InvariantsModule } from '../invariants/invariants.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { NodesModule } from '../nodes/nodes.module';
import { PotService } from './pot.service';

@Module({
  imports: [NodechainModule, InvariantsModule, NodesModule],
  providers: [PotService],
  exports: [PotService],
})
export class PotModule {}
