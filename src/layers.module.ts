import { Module } from '@nestjs/common';
import { NodechainModule } from './nodechain/nodechain.module';
import { NodechainService } from './nodechain/nodechain.service';
import { PotService } from './pot/pot.service';
import { ProcessService } from './processing/process.service';
import { TokenService } from './token/token.service';
import { ArosCoinService } from './aroscoin/aroscoin.service';
import { EmissionService } from './emission/emission.service';
import { CommissionService } from './commission/commission.service';
import { ReserveService } from './reserve/reserve.service';
import { AllSeeingEyeService } from './all-seeing-eye/all-seeing-eye.service';
import { GovernanceService } from './governance/governance.service';
import { OrchestratorService } from './orchestrator/orchestrator.service';
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
      provide: ArosCoinService,
      inject: [NodechainService, TokenService],
      useFactory: (nc: NodechainService, token: TokenService) => new ArosCoinService(nc, token),
    },
    {
      provide: EmissionService,
      inject: [NodechainService, ArosCoinService],
      useFactory: (nc: NodechainService, coin: ArosCoinService) => new EmissionService(nc, coin),
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
      provide: OrchestratorService,
      inject: [NodechainService, KEY_REGISTRY, INDEX_MIRROR],
      useFactory: (nc: NodechainService, keys: KeyRegistry, mirror: IndexMirror) =>
        new OrchestratorService(nc, keys, mirror),
    },
    {
      provide: TokenizationPipeline,
      inject: [NodechainService, KEY_REGISTRY, INDEX_MIRROR],
      useFactory: (nc: NodechainService, keys: KeyRegistry, mirror: IndexMirror) =>
        new TokenizationPipeline(nc, keys, mirror),
    },
  ],
  exports: [
    NodechainModule,
    EncodingService,
    ProcessService,
    PotService,
    TokenService,
    ArosCoinService,
    EmissionService,
    CommissionService,
    ReserveService,
    AllSeeingEyeService,
    GovernanceService,
    OrchestratorService,
    TokenizationPipeline,
    INDEX_MIRROR,
  ],
})
export class LayersModule {}
