import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { ProcessesModule } from '../processes/processes.module';

@Module({
  imports: [ProcessesModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
