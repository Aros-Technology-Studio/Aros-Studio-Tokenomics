import { Module } from '@nestjs/common';
import { NodechainModule } from './nodechain/nodechain.module';
import { NodechainService } from './nodechain/nodechain.service';
import { PotService } from './pot/pot.service';
import { ProcessService } from './processing/process.service';
import { TokenService } from './token/token.service';
import { CommissionService } from './commission/commission.service';
import { ReserveService } from './reserve/reserve.service';
import { AllSeeingEyeService } from './all-seeing-eye/all-seeing-eye.service';
import { GovernanceService } from './governance/governance.service';
import { TokenizationPipeline } from './intake/tokenization.pipeline';
import { KEY_REGISTRY } from './nodechain/nodechain.module';
import type { KeyRegistry } from './common/crypto/key-registry';
import { MemoryIndexMirror, type IndexMirror } from './index-mirror/index-mirror';
import { PostgresIndexMirror } from './index-mirror/postgres-index-mirror';
import { EncodingService } from './tx-encoding/encoding.service';

export const INDEX_MIRROR = 'INDEX_MIRROR';

@Module({
  imports: [NodechainModule],
  providers: [
    EncodingService,
    {
      provide: ProcessService,
      inject: [NodechainService, EncodingService],
      useFactory: (nc: NodechainService, enc: EncodingService) => new ProcessService(nc, enc),
    },
    {
      provide: PotService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new PotService(nc),
    },
    {
      provide: TokenService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new TokenService(nc),
    },
    {
      provide: CommissionService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new CommissionService(nc),
    },
    {
      provide: ReserveService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new ReserveService(nc),
    },
    AllSeeingEyeService,
    {
      provide: GovernanceService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new GovernanceService(nc),
    },
    {
      provide: INDEX_MIRROR,
      useFactory: (): IndexMirror => {
        const url = process.env.DATABASE_URL;
        if (url) return new PostgresIndexMirror(url);
        return new MemoryIndexMirror();
      },
    },
    {
      provide: TokenizationPipeline,
      inject: [NodechainService, KEY_REGISTRY],
      useFactory: (nc: NodechainService, keys: KeyRegistry) =>
        new TokenizationPipeline(nc, keys),
    },
  ],
  exports: [
    NodechainModule,
    EncodingService,
    ProcessService,
    PotService,
    TokenService,
    CommissionService,
    ReserveService,
    AllSeeingEyeService,
    GovernanceService,
    TokenizationPipeline,
    INDEX_MIRROR,
  ],
})
export class LayersModule {}
