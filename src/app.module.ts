import { Module } from '@nestjs/common';
import { LayersModule } from './layers.module';
import { CoreApiModule } from './core-api/core-api.module';
import { HealthController } from './health.controller';

@Module({
  imports: [LayersModule, CoreApiModule],
  controllers: [HealthController],
})
export class AppModule {}
