import { Module } from '@nestjs/common';
import { NodechainModule } from './nodechain/nodechain.module';
import { HealthController } from './health.controller';

@Module({
  imports: [NodechainModule],
  controllers: [HealthController],
})
export class AppModule {}
