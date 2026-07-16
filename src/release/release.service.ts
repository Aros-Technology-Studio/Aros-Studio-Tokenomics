import { Injectable } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { InvariantsService } from '../invariants/invariants.service';
import { NodechainService } from '../nodechain/nodechain.service';

export type ReleasePhaseState = 'inactive' | 'active';

/**
 * Release Phase gates (CANON §VII, I8).
 * Activation: system metrics + governance approval (release pack).
 */
@Injectable()
export class ReleaseService {
  private state: ReleasePhaseState = 'inactive';
  private governanceApproved = false;

  constructor(
    private readonly nodechain: NodechainService,
    private readonly invariants: InvariantsService,
  ) {}

  getState(): ReleasePhaseState {
    return this.state;
  }

  /** Governance multi-step simplified as single flag for v1 skeleton. */
  setGovernanceApproval(approved: boolean): void {
    this.governanceApproved = approved;
  }

  /**
   * Attempt activation after daemon signals thresholds met.
   * Requires governance approval; records NodeChain event.
   */
  activateFromDaemon(input: {
    reserveIndex: number;
    velocity: number;
    threshold: number;
    target: number;
  }): ReleasePhaseState {
    if (
      !(input.reserveIndex > input.threshold && input.velocity > input.target)
    ) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'thresholds not met');
    }
    if (!this.governanceApproved) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'governance approval required');
    }

    this.state = 'active';
    this.nodechain.append({
      writerRole: 'internal_service',
      recordType: 'release_phase_activated',
      payload: {
        reserveIndex: input.reserveIndex,
        velocity: input.velocity,
        threshold: input.threshold,
        target: input.target,
        prevState: 'inactive',
      },
    });
    return this.state;
  }

  deactivateViaGovernance(): ReleasePhaseState {
    if (!this.governanceApproved) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'governance required for reverse');
    }
    this.state = 'inactive';
    this.nodechain.append({
      writerRole: 'internal_service',
      recordType: 'release_phase_deactivated',
      payload: { prevState: 'active' },
    });
    return this.state;
  }

  /**
   * Gate external circulation attempts (I8).
   * Blocked when inactive: free external transfer, CEX listing, public trading.
   */
  assertExternalActionAllowed(action: 'external_transfer' | 'cex_listing' | 'public_trading' | 'bridge'): void {
    const external = true;
    this.invariants.assertInvariant('I8', {
      releasePhaseActive: this.state === 'active',
      externalCirculationAttempt: external && this.state !== 'active',
    });
    if (this.state !== 'active') {
      throw new AstError(
        AstErrorCode.INVALID_AMOUNT,
        `external action blocked before Release Phase: ${action}`,
      );
    }
  }
}
