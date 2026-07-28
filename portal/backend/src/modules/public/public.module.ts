import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { NodechainPublicController } from './nodechain-public.controller';
import { NodechainPublicService } from './nodechain-public.service';
import { ProcessesModule } from '../processes/processes.module';

@Module({
  imports: [ProcessesModule],
  controllers: [PublicController, NodechainPublicController],
  providers: [NodechainPublicService],
})
export class PublicModule {}
