import { InvariantId } from '../common/errors/error-codes';

export type { InvariantId };

/** Versioned id: I-ID-vX.Y (invariants pack). */
export type VersionedInvariantId = `I-${number}-v${number}.${number}`;

export interface InvariantContext {
  processId?: string;
  potVerified?: 0 | 1;
  emissionBoundToProcess?: boolean;
  burnBoundToProcess?: boolean;
  significantEventOnNodeChain?: boolean;
  recordedInputsHash?: string;
  replayInputsHash?: string;
  holdsThirdPartyFunds?: boolean;
  holdsOnlyOwnFunds?: boolean;
  releasePhaseActive?: boolean;
  externalCirculationAttempt?: boolean;
  speculativeHolding?: boolean;
  newEmissionProRata?: boolean;
  isNewEmission?: boolean;
  killSwitchActive?: boolean;
}

export interface InvariantResult {
  id: InvariantId;
  versionedId: VersionedInvariantId;
  ok: boolean;
  reasonCode?: string;
}

export type InvariantPredicate = (ctx: InvariantContext) => boolean;
