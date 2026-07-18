import { Module } from '@nestjs/common';
import { NodechainModule } from '../nodechain/nodechain.module';
import { PotService } from './pot.service';

@Module({
  imports: [NodechainModule],
  providers: [PotService],
  exports: [PotService],
})
export class PotModule {}
