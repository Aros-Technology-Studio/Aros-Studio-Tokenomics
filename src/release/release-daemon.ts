import type { NodechainService } from '../nodechain/nodechain.service';
import type { ReserveService } from '../reserve/reserve.service';
import type { ArosCoinService } from '../aroscoin/aroscoin.service';
import { loadReleaseConfig, type ReleaseConfig } from './config';
import { VelocityTracker } from './velocity-tracker';

export interface ReleaseStatus {
  active: boolean;
  reserveIndex: number;
  velocity: number;
  threshold: number;
  target: number;
  activatedAtUtc?: string;
  processVolume24h?: string;
}

/**
 * release_daemon — tracks reserveIndex + velocity; activates Release Phase when both pass.
 * Canon §7 / §9.7: ReleasePhase = (reserveIndex > threshold) ∧ (velocity > target)
 */
export class ReleaseDaemon {
  private active = false;
  private activatedAtUtc?: string;
  private readonly config: ReleaseConfig;
  private readonly velocity: VelocityTracker;

  constructor(
    private readonly nodechain: NodechainService,
    private readonly reserve: ReserveService,
    private readonly aroscoin: ArosCoinService,
    config?: Partial<ReleaseConfig>,
  ) {
    this.config = { ...loadReleaseConfig(), ...config };
    this.velocity = new VelocityTracker(nodechain);
  }

  isActive(): boolean {
    return this.active;
  }

  getConfig(): ReleaseConfig {
    return { ...this.config };
  }

  async status(): Promise<ReleaseStatus> {
    const reserveIndex = this.reserve.reserveIndex();
    const v = await this.velocity.compute(this.aroscoin.totalSupply());
    return {
      active: this.active,
      reserveIndex,
      velocity: v.velocity,
      threshold: this.config.threshold,
      target: this.config.target,
      activatedAtUtc: this.activatedAtUtc,
      processVolume24h: v.processVolume24h,
    };
  }

  /**
   * One evaluation tick. Safe to call from timer or tests.
   * Once active, stays active (no auto-deactivation in v1).
   */
  async tick(): Promise<ReleaseStatus> {
    const st = await this.status();
    if (!this.active && st.reserveIndex > this.config.threshold && st.velocity > this.config.target) {
      this.active = true;
      this.activatedAtUtc = new Date().toISOString();
      await this.nodechain.append({
        clientRecordId: `release-activate:${this.activatedAtUtc}`,
        recordType: 'param_change',
        processId: null,
        payload: {
          kind: 'release_phase_activated',
          reserveIndex: st.reserveIndex,
          velocity: st.velocity,
          threshold: this.config.threshold,
          target: this.config.target,
          atUtc: this.activatedAtUtc,
        },
        writerId: 'system',
        writerRole: 'system',
      });
      return this.status();
    }
    return st;
  }

  /** Test/admin: force inactive (not a product rollback of market phase). */
  resetForTests(): void {
    this.active = false;
    this.activatedAtUtc = undefined;
  }
}
