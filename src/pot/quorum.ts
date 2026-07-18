import { PotReason } from './reason-codes';
import type { QuorumResult } from './types';
import { defaultPotConfig } from './types';

/**
 * M-of-N confirmer quorum. Default Q = ceil(2/3·K), K_min = 3.
 * Not stake-weighted.
 */
export function evaluateQuorum(
  confirmers: string[],
  validatorIds: string[],
  ratio = defaultPotConfig.quorumRatio,
  kMin = defaultPotConfig.kMin,
): QuorumResult {
  const reasonCodes: string[] = [];
  const K = validatorIds.length;
  if (K < kMin) {
    reasonCodes.push(PotReason.QUORUM_K_BELOW_MIN);
    return { ok: false, K, Q: 0, confirmerCount: 0, reasonCodes };
  }
  const Q = Math.ceil(ratio * K);
  const eligible = new Set(validatorIds);
  const valid = [...new Set(confirmers)].filter((c) => eligible.has(c));
  const confirmerCount = valid.length;
  const ok = confirmerCount >= Q;
  if (!ok) reasonCodes.push(PotReason.QUORUM_SHORT);
  return { ok, K, Q, confirmerCount, reasonCodes };
}

export function quorumOk(
  confirmers: string[],
  validatorIds: string[],
  ratio = defaultPotConfig.quorumRatio,
): boolean {
  return evaluateQuorum(confirmers, validatorIds, ratio).ok;
}
