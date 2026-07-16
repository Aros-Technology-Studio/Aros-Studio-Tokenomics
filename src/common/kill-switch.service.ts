import { Injectable } from '@nestjs/common';
import { AstError } from './errors/ast-error';
import { AstErrorCode } from './errors/error-codes';

/**
 * Kill switch / read-only mode (CANON §XII, Phase 5).
 * KILL_SWITCH=true → no new economic causes.
 */
@Injectable()
export class KillSwitchService {
  private active = process.env.KILL_SWITCH === 'true';

  isActive(): boolean {
    return this.active;
  }

  /** Test/ops control (never a backdoor mint). */
  setActive(active: boolean): void {
    this.active = active;
  }

  assertAllowsNewEconomicCause(): void {
    if (this.active) {
      throw new AstError(
        AstErrorCode.KILL_SWITCH_ACTIVE,
        'kill switch active — read-only mode',
      );
    }
  }
}
