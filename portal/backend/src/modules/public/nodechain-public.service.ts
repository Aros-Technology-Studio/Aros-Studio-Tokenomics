import { Injectable } from '@nestjs/common';
import { CoreApiClient } from '../../common/core-client';

/**
 * Public NodeChain read proxy.
 * Edge only — never appends, never mints.
 */
@Injectable()
export class NodechainPublicService {
  private readonly core: CoreApiClient;

  constructor(core?: CoreApiClient) {
    this.core = core ?? new CoreApiClient();
  }

  private async proxy(
    fn: () => Promise<{ statusCode: number; body: Record<string, unknown> }>,
  ) {
    if (!this.core.enabled) {
      return {
        statusCode: 503,
        body: {
          code: 'CORE_HANDOFF_DISABLED',
          message: 'Core hand-off disabled — NodeChain UI unavailable',
        },
      };
    }
    return fn();
  }

  status() {
    return this.proxy(() => this.core.getNodechainStatus());
  }

  tip() {
    return this.proxy(() => this.core.getNodechainTip());
  }

  verify() {
    return this.proxy(() => this.core.getNodechainVerify());
  }

  byHeight(height: number) {
    return this.proxy(() => this.core.getNodechainByHeight(height));
  }

  byRecordId(recordId: string) {
    return this.proxy(() => this.core.getNodechainByRecordId(recordId));
  }

  byProcess(processId: string, limit?: number) {
    return this.proxy(() => this.core.getNodechainByProcess(processId, limit));
  }

  blocks(limit?: number) {
    return this.proxy(() => this.core.getNodechainBlocks(limit));
  }
}
