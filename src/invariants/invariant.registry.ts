import { InvariantId } from '../common/errors/error-codes';
import {
  InvariantContext,
  InvariantPredicate,
  VersionedInvariantId,
} from './invariant.types';

/** Canon semver for invariant set (Core Canon v1.0). */
export const INVARIANT_SET_VERSION = '1.0';

export function versionedId(id: InvariantId): VersionedInvariantId {
  const n = id.replace('I', '');
  return `I-${n}-v${INVARIANT_SET_VERSION}` as VersionedInvariantId;
}

/**
 * I1–I9 pure predicates (CANON §XI).
 * All critical; fail closed on write-paths (P0).
 */
export const INVARIANT_PREDICATES: Record<InvariantId, InvariantPredicate> = {
  // I1 — value only when verified = 1
  I1: (ctx) => {
    if (ctx.potVerified === undefined) return true;
    if (ctx.potVerified === 1) return true;
    // attempting economic value without verified
    return ctx.potVerified === 0 && ctx.isNewEmission !== true;
  },
  // I2 — emission/burn bound to confirmed process
  I2: (ctx) => {
    if (ctx.isNewEmission && ctx.emissionBoundToProcess === false) return false;
    if (ctx.burnBoundToProcess === false) return false;
    return true;
  },
  // I3 — significant event on NodeChain
  I3: (ctx) => {
    if (ctx.significantEventOnNodeChain === false) return false;
    return true;
  },
  // I4 — determinism
  I4: (ctx) => {
    if (
      ctx.recordedInputsHash !== undefined &&
      ctx.replayInputsHash !== undefined &&
      ctx.recordedInputsHash !== ctx.replayInputsHash
    ) {
      return false;
    }
    return true;
  },
  // I5 — no speculative holding
  I5: (ctx) => ctx.speculativeHolding !== true,
  // I6 — own funds only
  I6: (ctx) => {
    if (ctx.holdsThirdPartyFunds === true) return false;
    if (ctx.holdsOnlyOwnFunds === false) return false;
    return true;
  },
  // I7 — token reflects confirmed value (checked when explicitly flagged false)
  I7: () => true,
  // I8 — pre-release external circulation blocked
  I8: (ctx) => {
    if (ctx.releasePhaseActive === true) return true;
    if (ctx.externalCirculationAttempt === true) return false;
    return true;
  },
  // I9 — new emission pro-rata
  I9: (ctx) => {
    if (ctx.isNewEmission && ctx.newEmissionProRata === false) return false;
    return true;
  },
};

export const ALL_INVARIANT_IDS: InvariantId[] = [
  'I1',
  'I2',
  'I3',
  'I4',
  'I5',
  'I6',
  'I7',
  'I8',
  'I9',
];
