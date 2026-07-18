import { NodechainService } from '../nodechain/nodechain.service';
import { globalKillSwitch } from './kill-switch';
import { NodeChainError, NcErrorCode } from '../nodechain/errors';

export interface HardeningConfig {
  /** Verify full chain every N successful appends (0 = off). */
  verifyEveryN: number;
  /** Max appends per processId. */
  maxRecordsPerProcess: number;
  /** Max valuation string for L3 high-value threshold (ARO). */
  highValueThreshold: string;
}

export const defaultHardeningConfig: HardeningConfig = {
  verifyEveryN: 10,
  maxRecordsPerProcess: 10_000,
  highValueThreshold: '1000000.000000000' };

/**
 * Hardening facade: kill-switch checks and process record budgets.
 * Chain verify interval is enforced inside NodechainService.
 */
export class HardeningGuard {
  constructor(
    private readonly nodechain: NodechainService,
    private readonly config: HardeningConfig = defaultHardeningConfig,
  ) {}

  beforeWrite(): void {
    globalKillSwitch.assertWritable();
    if (this.nodechain.isReadOnly()) {
      throw new NodeChainError(NcErrorCode.READ_ONLY, 'journal read-only');
    }
  }

  async assertProcessRecordBudget(processId: string): Promise<void> {
    const rows = await this.nodechain.listByProcessId(processId);
    if (rows.length >= this.config.maxRecordsPerProcess) {
      throw new Error('HARDENING: max records per process exceeded');
    }
  }
}
