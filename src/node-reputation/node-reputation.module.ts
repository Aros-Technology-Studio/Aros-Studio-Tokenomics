import { Module } from '@nestjs/common';
import { NodesModule } from '../nodes/nodes.module';
import { NodeReputationService } from './node-reputation.service';

@Module({
  imports: [NodesModule],
  providers: [NodeReputationService],
  exports: [NodeReputationService],
})
export class NodeReputationModule {}
