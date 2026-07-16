import { Module } from '@nestjs/common';
import { InvariantsModule } from '../invariants/invariants.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { PotModule } from '../pot/pot.module';
import { AroscoinService } from './aroscoin.service';

@Module({
  imports: [PotModule, NodechainModule, InvariantsModule],
  providers: [AroscoinService],
  exports: [AroscoinService],
})
export class AroscoinModule {}
