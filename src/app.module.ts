import { Module } from '@nestjs/common';
import { LayersModule } from './layers.module';
import { HealthController } from './health.controller';

@Module({
  imports: [LayersModule],
  controllers: [HealthController] })
export class AppModule {}
