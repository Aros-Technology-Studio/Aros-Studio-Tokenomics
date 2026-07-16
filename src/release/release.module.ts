import { Module } from '@nestjs/common';
import { InvariantsModule } from '../invariants/invariants.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { ReleaseService } from './release.service';

@Module({
  imports: [NodechainModule, InvariantsModule],
  providers: [ReleaseService],
  exports: [ReleaseService],
})
export class ReleaseModule {}
