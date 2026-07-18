import { Module } from '@nestjs/common';
import { LayersModule } from '../layers.module';
import { CoreProcessesController } from './processes.controller';
import { CoreNodesController } from './nodes.controller';
import { CoreReleaseController } from './release.controller';
import { CoreEyeController } from './eye.controller';

@Module({
  imports: [LayersModule],
  controllers: [
    CoreProcessesController,
    CoreNodesController,
    CoreReleaseController,
    CoreEyeController,
  ],
})
export class CoreApiModule {}
