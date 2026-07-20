import { Module } from '@nestjs/common';
import { ProcessesModule } from '../processes/processes.module';

/**
 * Tokenization domain module — primary process submit lives under ProcessesModule.
 * Alias module for product structure (institutional package admission).
 */
@Module({
  imports: [ProcessesModule],
  exports: [ProcessesModule],
})
export class TokenizationModule {}
