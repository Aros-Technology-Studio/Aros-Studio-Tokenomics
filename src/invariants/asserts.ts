import { isValidProcessId } from '../common/process-id';
import { InvariantId } from './codes';
import { InvariantError } from './errors';

/** I1 — value / emit path only when PoT verified=1 */
export function assertI1_poTVerified(verified: 0 | 1 | number | boolean): void {
  if (verified !== 1 && verified !== true) {
    throw new InvariantError(
      InvariantId.I1,
      'I1 fail-closed: value requires PoT verified=1',
      [`verified=${String(verified)}`],
    );
  }
}

/** I2 — emission/burn bound to processId */
export function assertI2_processBound(processId: string | null | undefined): void {
  if (!processId?.trim() || !isValidProcessId(processId)) {
    throw new InvariantError(
      InvariantId.I2,
      'I2 fail-closed: emission/burn requires valid processId',
      [`processId=${String(processId)}`],
    );
  }
}

/** I3 — significant event must be journaled (caller passes proof of record) */
export function assertI3_nodeChainRecorded(
  recorded: boolean,
  hint = 'NodeChain record missing',
): void {
  if (!recorded) {
    throw new InvariantError(InvariantId.I3, `I3 fail-closed: ${hint}`);
  }
}

/** I4 — deterministic identity (same logical input → same digest) */
export function assertI4_deterministic(expectedHash: string, actualHash: string): void {
  if (!expectedHash || expectedHash !== actualHash) {
    throw new InvariantError(
      InvariantId.I4,
      'I4 fail-closed: deterministic hash mismatch',
      [`expected=${expectedHash}`, `actual=${actualHash}`],
    );
  }
}

/** I5 — speculative holding / yield surfaces forbidden at core API */
export function assertI5_noSpeculativeHolding(flag: boolean): void {
  if (flag) {
    throw new InvariantError(
      InvariantId.I5,
      'I5 fail-closed: speculative holding is forbidden',
    );
  }
}

/** I6 — third-party custody forbidden */
export function assertI6_ownFundsOnly(holdsThirdPartyFunds: boolean): void {
  if (holdsThirdPartyFunds) {
    throw new InvariantError(
      InvariantId.I6,
      'I6 fail-closed: AST holds only its own funds',
    );
  }
}

/** I7 — token supply path must track confirmed asset value delta */
export function assertI7_reflectsConfirmedValue(ok: boolean, detail?: string): void {
  if (!ok) {
    throw new InvariantError(
      InvariantId.I7,
      detail ?? 'I7 fail-closed: token must reflect confirmed asset value',
    );
  }
}

/** I8 — pre-release circulation limited to internal roles */
export function assertI8_internalCirculation(
  releasePhaseActive: boolean,
  role: string,
  allowedInternalRoles: readonly string[] = [
    'institution',
    'holder',
    'node',
    'orchestrator',
    'system',
    'token',
  ],
): void {
  if (releasePhaseActive) return;
  if (!allowedInternalRoles.includes(role)) {
    throw new InvariantError(
      InvariantId.I8,
      `I8 fail-closed: role "${role}" not allowed before Release Phase`,
      [`role=${role}`],
    );
  }
}

/** I9 — new emission must use pro-rata path when multi-holder reval/mint split */
export function assertI9_proRataEmission(isProRata: boolean): void {
  if (!isProRata) {
    throw new InvariantError(
      InvariantId.I9,
      'I9 fail-closed: new emission must be pro-rata to current holders',
    );
  }
}

export type CriteriaFlags = { P1: boolean; P2: boolean; P3: boolean; P4: boolean };

/** PoT criteria gate used by ok-to-emit (all P1–P4 required). */
export function assertCriteriaP1P4(c: CriteriaFlags | null | undefined): void {
  if (!c || !c.P1 || !c.P2 || !c.P3 || !c.P4) {
    throw new InvariantError(
      InvariantId.I1,
      'I1 fail-closed: PoT criteria P1–P4 must all pass',
      [
        `P1=${String(c?.P1)}`,
        `P2=${String(c?.P2)}`,
        `P3=${String(c?.P3)}`,
        `P4=${String(c?.P4)}`,
      ],
    );
  }
}
