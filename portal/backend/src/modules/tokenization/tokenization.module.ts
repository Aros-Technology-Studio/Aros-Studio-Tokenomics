import { Module } from '@nestjs/common';
import { ProcessesModule } from '../processes/processes.module';
import { TokenizationController } from './tokenization.controller';

/**
 * Tokenization domain — product path POST /v1/tokenization/start.
 * Delegates to ProcessesService (no mint on edge).
 */
@Module({
  imports: [ProcessesModule],
  controllers: [TokenizationController],
  exports: [ProcessesModule],
})
export class TokenizationModule {}
