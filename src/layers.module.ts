import { Module } from '@nestjs/common';
import { NodechainModule } from './nodechain/nodechain.module';
import { NodechainService } from './nodechain/nodechain.service';
import { PotService } from './pot/pot.service';
import { ProcessService } from './processing/process.service';
import { TokenService } from './token/token.service';
import { CommissionService } from './commission/commission.service';
import { ReserveService } from './reserve/reserve.service';
import { EyeService } from './eye/eye.service';
import { GovernanceService } from './governance/governance.service';
import { TokenizationPipeline } from './intake/tokenization.pipeline';
import { KEY_REGISTRY } from './nodechain/nodechain.module';
import type { KeyRegistry } from './common/crypto/key-registry';
import { MemoryIndexMirror, type IndexMirror } from './index-mirror/index-mirror';
import { PostgresIndexMirror } from './index-mirror/postgres-index-mirror';

export const INDEX_MIRROR = 'INDEX_MIRROR';

@Module({
  imports: [NodechainModule],
  providers: [
    {
      provide: ProcessService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new ProcessService(nc) },
    {
      provide: PotService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new PotService(nc) },
    {
      provide: TokenService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new TokenService(nc) },
    {
      provide: CommissionService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new CommissionService(nc) },
    {
      provide: ReserveService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new ReserveService(nc) },
    EyeService,
    {
      provide: GovernanceService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new GovernanceService(nc) },
    {
      provide: INDEX_MIRROR,
      useFactory: (): IndexMirror => {
        const url = process.env.DATABASE_URL;
        if (url) return new PostgresIndexMirror(url);
        return new MemoryIndexMirror();
      } },
    {
      provide: TokenizationPipeline,
      inject: [NodechainService, KEY_REGISTRY],
      useFactory: (nc: NodechainService, keys: KeyRegistry) =>
        new TokenizationPipeline(nc, keys) },
  ],
  exports: [
    NodechainModule,
    ProcessService,
    PotService,
    TokenService,
    CommissionService,
    ReserveService,
    EyeService,
    GovernanceService,
    TokenizationPipeline,
    INDEX_MIRROR,
  ] })
export class LayersModule {}
