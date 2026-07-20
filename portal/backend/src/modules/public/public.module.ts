import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ProcessesModule } from '../processes/processes.module';

@Module({
  imports: [ProcessesModule],
  controllers: [PublicController],
})
export class PublicModule {}
