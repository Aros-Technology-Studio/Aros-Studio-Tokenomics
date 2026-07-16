import { Injectable } from '@nestjs/common';
import { NodesService } from '../nodes/nodes.service';

/** Grace period 24h (CANON §XII). */
export const SUSPEND_GRACE_MS = 24 * 60 * 60 * 1000;

interface ReputationRow {
  successes: number;
  total: number;
  suspendedAt?: number;
}

/**
 * nodeReputation = (successes/total) * uptimeFactor (CANON §9.8).
 * Suspend without slashing — reputation + quorum exclusion via NodesService.
 */
@Injectable()
export class NodeReputationService {
  private readonly rows = new Map<string, ReputationRow>();

  constructor(private readonly nodes: NodesService) {}

  recordParticipation(nodeId: string, success: boolean): void {
    const row = this.rows.get(nodeId) ?? { successes: 0, total: 0 };
    row.total += 1;
    if (success) row.successes += 1;
    this.rows.set(nodeId, row);
  }

  reputation(nodeId: string, uptimeFactor: number): number {
    const row = this.rows.get(nodeId) ?? { successes: 0, total: 0 };
    if (row.total === 0) return 0;
    return (row.successes / row.total) * uptimeFactor;
  }

  /** Weight for commission distribution. */
  weight(nodeId: string, uptimeFactor: number): number {
    const r = this.reputation(nodeId, uptimeFactor);
    return Math.max(r, 0);
  }

  suspendWithGrace(nodeId: string, now = Date.now()): void {
    this.nodes.suspend(nodeId);
    const row = this.rows.get(nodeId) ?? { successes: 0, total: 0 };
    row.suspendedAt = now;
    this.rows.set(nodeId, row);
  }

  /** Restore after grace if eligible. */
  maybeRestore(nodeId: string, now = Date.now()): boolean {
    const row = this.rows.get(nodeId);
    if (!row?.suspendedAt) return false;
    if (now - row.suspendedAt < SUSPEND_GRACE_MS) return false;
    this.nodes.restore(nodeId);
    row.suspendedAt = undefined;
    return true;
  }
}
