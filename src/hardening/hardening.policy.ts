import { NodechainService } from '../nodechain/nodechain.service';
import { globalKillSwitch } from './kill-switch';
import { NodeChainError, NcErrorCode } from '../nodechain/errors';

export interface HardeningConfig {
  /** Verify full chain every N successful appends (0 = off). */
  verifyEveryN: number;
  /** Max appends per processId (soft abuse guard). */
  maxRecordsPerProcess: number;
  /** Require real ed25519 signatures (reject dev-self-attest). */
  requireRealCrypto: boolean;
  /** Max valuation string for L3 escalate threshold (ARO). */
  highValueThreshold: string;
}

export const defaultHardeningConfig: HardeningConfig = {
  verifyEveryN: 10,
  maxRecordsPerProcess: 10_000,
  requireRealCrypto: true,
  highValueThreshold: '1000000.000000000',
};

/**
 * Hardening facade: kill-switch, periodic chain integrity, process record caps.
 */
export class HardeningGuard {
  private appendCount = 0;

  constructor(
    private readonly nodechain: NodechainService,
    private readonly config: HardeningConfig = defaultHardeningConfig,
  ) {}

  beforeWrite(): void {
    globalKillSwitch.assertWritable();
    if (this.nodechain['readOnly']) {
      throw new NodeChainError(NcErrorCode.READ_ONLY, 'journal read-only');
    }
  }

  async afterWrite(): Promise<void> {
    this.appendCount += 1;
    if (this.config.verifyEveryN > 0 && this.appendCount % this.config.verifyEveryN === 0) {
      const v = await this.nodechain.verifyChain();
      if (!v.ok) {
        globalKillSwitch.engage(`chain integrity failed at height ${v.height}: ${v.error}`);
        this.nodechain.setReadOnly(true);
        throw new Error(`HARDENING: chain broken — kill-switch engaged`);
      }
    }
  }

  async assertProcessRecordBudget(processId: string): Promise<void> {
    const rows = await this.nodechain.listByProcessId(processId);
    if (rows.length >= this.config.maxRecordsPerProcess) {
      throw new Error(`HARDENING: max records per process exceeded`);
    }
  }
}
