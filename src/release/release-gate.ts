import { InvariantError, InvariantId } from '../invariants';
import type { ReleaseDaemon } from './release-daemon';

const INTERNAL_ROLES = new Set([
  'institution',
  'holder',
  'node',
  'orchestrator',
  'system',
  'token',
  'emission',
  'settlement',
  'confirmer',
  'executor',
  'observer',
]);

/**
 * Until Release Phase, free external / CEX-style circulation is blocked (I8).
 */
export function assertInternalCirculation(
  release: ReleaseDaemon,
  role: string,
  action: 'internal_transfer' | 'external_transfer' | 'cex_list' | 'public_trade',
): void {
  if (release.isActive()) {
    return; // broader regime allowed after activation
  }
  if (action !== 'internal_transfer') {
    throw new InvariantError(
      InvariantId.I8,
      `I8 fail-closed: ${action} blocked until Release Phase`,
      [`action=${action}`],
    );
  }
  if (!INTERNAL_ROLES.has(role)) {
    throw new InvariantError(
      InvariantId.I8,
      `I8 fail-closed: role "${role}" not allowed before Release Phase`,
    );
  }
}
