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
import { NodeRegistryService } from './nodes/node-registry.service';
import { NodeReputationService } from './nodes/node-reputation.service';
import { ReleaseDaemon } from './release/release-daemon';
import { KEY_REGISTRY } from './nodechain/nodechain.module';
import type { KeyRegistry } from './common/crypto/key-registry';
import { MemoryIndexMirror, type IndexMirror } from './index-mirror/index-mirror';
import { PostgresIndexMirror } from './index-mirror/postgres-index-mirror';
import { EncodingService } from './tx-encoding/encoding.service';
import { EventStreamService } from './event-stream/event-stream.service';

export const INDEX_MIRROR = 'INDEX_MIRROR';
export const EVENT_STREAM = 'EVENT_STREAM';

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
    {
      provide: EventStreamService,
      useFactory: async () => EventStreamService.createDefault(),
    },
    {
      provide: AllSeeingEyeService,
      inject: [EventStreamService],
      useFactory: (stream: EventStreamService) => new AllSeeingEyeService(stream),
    },
    {
      provide: INDEX_MIRROR,
      useFactory: (): IndexMirror => {
        const url = process.env.DATABASE_URL?.trim();
        if (url) return new PostgresIndexMirror(url);
        return new MemoryIndexMirror();
      },
    },
    {
      provide: 'OBSERVER_MIRROR_WIRE',
      inject: [NodechainService, EventStreamService, INDEX_MIRROR],
      useFactory: (
        nc: NodechainService,
        stream: EventStreamService,
        mirror: IndexMirror,
      ) => {
        // B4 event stream + B6 continuous mirror upsert (journal remains SoT)
        nc.setOnRecordAppended(async (record) => {
          let lastEvent: import('./event-stream/types').ObserverEvent | null = null;
          try {
            lastEvent = await stream.onRecordAppended(record);
          } catch {
            /* non-fatal */
          }
          try {
            await mirror.upsert(record);
          } catch {
            /* lag allowed; rebuild via POST /v1/core/mirror/replay */
          }
          // I3 optional outbound (HTTP / Kafka CLI) — never blocks SoT
          if (lastEvent) {
            try {
              const { fanOutObserverEvent, eventOutConfigured } = await import(
                './event-stream/event-out-bridge'
              );
              if (eventOutConfigured()) {
                await fanOutObserverEvent(lastEvent);
              }
            } catch {
              /* non-fatal */
            }
          }
        });
        return true;
      },
    },
    {
      provide: GovernanceService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => new GovernanceService(nc),
    },
    {
      provide: NodeRegistryService,
      inject: [NodechainService],
      useFactory: (nc: NodechainService) => {
        const reg = new NodeRegistryService(nc);
        reg.registerMany(['v1', 'v2', 'v3'], 'confirmer');
        return reg;
      },
    },
    NodeReputationService,
    {
      provide: ReleaseDaemon,
      inject: [NodechainService, ReserveService, ArosCoinService],
      useFactory: (nc: NodechainService, reserve: ReserveService, coin: ArosCoinService) =>
        new ReleaseDaemon(nc, reserve, coin),
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
    EventStreamService,
    AllSeeingEyeService,
    GovernanceService,
    NodeRegistryService,
    NodeReputationService,
    ReleaseDaemon,
    OrchestratorService,
    TokenizationPipeline,
    INDEX_MIRROR,
  ],
})
export class LayersModule {}
