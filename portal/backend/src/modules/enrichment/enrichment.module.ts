import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EnrichmentController } from './enrichment.controller';
import { EnrichmentService } from './enrichment.service';

@Module({
  imports: [AuthModule],
  controllers: [EnrichmentController],
  providers: [EnrichmentService],
})
export class EnrichmentModule {}
