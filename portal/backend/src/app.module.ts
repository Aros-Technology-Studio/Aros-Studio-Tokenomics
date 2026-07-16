import { Module } from '@nestjs/common';
import { HealthController } from './modules/health/health.controller';
import { TokenizationController } from './modules/tokenization/tokenization.controller';
import { ProcessesController } from './modules/processes/processes.controller';
import { AssetsController } from './modules/assets/assets.controller';
import { DocumentsController } from './modules/documents/documents.controller';

/**
 * Portal edge modules only.
 * Core PoT / NodeChain / Emission live in repository root src/ (future), not here.
 */
@Module({
  controllers: [
    HealthController,
    TokenizationController,
    DocumentsController,
    ProcessesController,
    AssetsController,
  ],
})
export class AppModule {}
