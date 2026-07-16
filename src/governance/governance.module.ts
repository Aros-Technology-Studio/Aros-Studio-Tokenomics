import { Module } from '@nestjs/common';
import { NodechainModule } from '../nodechain/nodechain.module';
import { GovernanceService } from './governance.service';

@Module({
  imports: [NodechainModule],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
