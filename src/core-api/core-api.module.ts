import { Module } from '@nestjs/common';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';
import { PartialReleaseModule } from '../partial-release/partial-release.module';
import { CorePartialReleaseController } from './core-partial-release.controller';
import { CoreProcessController } from './core-process.controller';

@Module({
  imports: [OrchestratorModule, PartialReleaseModule],
  controllers: [CoreProcessController, CorePartialReleaseController],
})
export class CoreApiModule {}

