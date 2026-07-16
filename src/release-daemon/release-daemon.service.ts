import { Injectable } from '@nestjs/common';
import { ReleaseService } from '../release/release.service';
import { ReserveService } from '../reserve/reserve.service';
import { VelocityTrackerService } from '../velocity-tracker/velocity-tracker.service';

/**
 * Monitors reserveIndex & velocity; initiates phase transition (release-daemon pack).
 * Config keys: release.threshold, release.target (numeric config-only).
 */
@Injectable()
export class ReleaseDaemonService {
  private threshold = Number(process.env.RELEASE_THRESHOLD ?? '1');
  private target = Number(process.env.RELEASE_TARGET ?? '0.1');

  constructor(
    private readonly reserve: ReserveService,
    private readonly velocity: VelocityTrackerService,
    private readonly release: ReleaseService,
  ) {}

  configure(threshold: number, target: number): void {
    this.threshold = threshold;
    this.target = target;
  }

  /**
   * One poll tick. Returns whether activation was attempted/succeeded.
   */
  tick(): { met: boolean; activated: boolean; reserveIndex: number; velocity: number } {
    const reserveIndex = this.reserve.reserveIndex();
    const velocity = this.velocity.velocity();
    const met = reserveIndex > this.threshold && velocity > this.target;
    if (!met) {
      return { met: false, activated: false, reserveIndex, velocity };
    }
    try {
      this.release.activateFromDaemon({
        reserveIndex,
        velocity,
        threshold: this.threshold,
        target: this.target,
      });
      return { met: true, activated: true, reserveIndex, velocity };
    } catch {
      // thresholds met but governance not approved yet
      return { met: true, activated: false, reserveIndex, velocity };
    }
  }
}
