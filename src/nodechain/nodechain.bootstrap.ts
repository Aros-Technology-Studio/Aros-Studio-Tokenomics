import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NodechainService } from './nodechain.service';

/**
 * Ensures genesis exists when the Nest core boots.
 * Idempotent — safe on every restart against file/rocksdb journals.
 */
@Injectable()
export class NodechainBootstrap implements OnModuleInit {
  private readonly log = new Logger(NodechainBootstrap.name);

  constructor(@Inject(NodechainService) private readonly nodechain: NodechainService) {}

  async onModuleInit(): Promise<void> {
    if (process.env.AST_SKIP_GENESIS_BOOT === '1' || process.env.AST_SKIP_GENESIS_BOOT === 'true') {
      this.log.warn('AST_SKIP_GENESIS_BOOT set — skipping ensureGenesis on boot');
      return;
    }
    const result = await this.nodechain.ensureGenesis('system');
    this.log.log(
      `NodeChain ready: genesis height=${result.height} recordId=${result.recordId} tipHash=${result.envelopeHash.slice(0, 16)}…`,
    );
  }
}
