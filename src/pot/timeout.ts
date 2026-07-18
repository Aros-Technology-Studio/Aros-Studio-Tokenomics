import { PotReason } from './reason-codes';
import { defaultPotConfig, POT_TIMEOUT_MS } from './types';

export { POT_TIMEOUT_MS };

/**
 * Pure timeout evaluation (Core Canon §XII default 15 minutes).
 * No I/O. Opened timestamp from process_open on NodeChain.
 */
export function evaluateTimeout(
  openedAtUtc: string | null,
  nowMs: number = Date.now(),
  timeoutMs: number = defaultPotConfig.timeoutMs,
): { expired: boolean; elapsedMs: number | null; timeoutMs: number; reasonCodes: string[] } {
  if (!openedAtUtc) {
    return { expired: false, elapsedMs: null, timeoutMs, reasonCodes: [] };
  }
  const opened = Date.parse(openedAtUtc);
  if (!Number.isFinite(opened)) {
    return {
      expired: true,
      elapsedMs: null,
      timeoutMs,
      reasonCodes: [PotReason.POT_TIMEOUT],
    };
  }
  const elapsedMs = nowMs - opened;
  if (elapsedMs > timeoutMs) {
    return {
      expired: true,
      elapsedMs,
      timeoutMs,
      reasonCodes: [PotReason.POT_TIMEOUT],
    };
  }
  return { expired: false, elapsedMs, timeoutMs, reasonCodes: [] };
}

/** True if evaluation is still inside the confirmation window. */
export function isWithinConfirmationWindow(
  openedAtUtc: string | null,
  nowMs: number = Date.now(),
  timeoutMs: number = POT_TIMEOUT_MS,
): boolean {
  return !evaluateTimeout(openedAtUtc, nowMs, timeoutMs).expired;
}
