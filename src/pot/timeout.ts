import { PotReason } from './reason-codes';
import { defaultPotConfig } from './types';

export function evaluateTimeout(
  openedAtUtc: string | null,
  nowMs: number = Date.now(),
  timeoutMs: number = defaultPotConfig.timeoutMs,
): { expired: boolean; reasonCodes: string[] } {
  if (!openedAtUtc) {
    return { expired: false, reasonCodes: [] };
  }
  const opened = Date.parse(openedAtUtc);
  if (!Number.isFinite(opened)) {
    return { expired: true, reasonCodes: [PotReason.POT_TIMEOUT] };
  }
  if (nowMs - opened > timeoutMs) {
    return { expired: true, reasonCodes: [PotReason.POT_TIMEOUT] };
  }
  return { expired: false, reasonCodes: [] };
}
