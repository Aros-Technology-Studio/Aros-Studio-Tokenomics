import { Module } from '@nestjs/common';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';
import { CoreProcessController } from './core-process.controller';

@Module({
  imports: [OrchestratorModule],
  controllers: [CoreProcessController],
})
export class CoreApiModule {}
