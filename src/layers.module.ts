import { Module } from '@nestjs/common';
import { NodechainModule } from './nodechain/nodechain.module';

/**
 * Nest aggregation for layers 01–10.
 * Services are constructed in TokenizationPipeline for the journal-backed path;
 * this module documents layer boundaries for DI expansion.
 */
@Module({
  imports: [NodechainModule],
  exports: [NodechainModule],
})
export class LayersModule {}
