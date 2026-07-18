import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ProcessesModule } from './processes/processes.module';

@Module({
  imports: [ProcessesModule],
  controllers: [HealthController],
})
export class AppModule {}
