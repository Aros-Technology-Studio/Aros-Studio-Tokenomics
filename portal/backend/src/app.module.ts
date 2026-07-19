import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ProcessesModule } from './processes/processes.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [AuthModule, ProcessesModule, DocumentsModule],
  controllers: [HealthController],
})
export class AppModule {}
