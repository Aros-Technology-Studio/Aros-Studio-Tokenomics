import type { ReputationSnapshot } from './types';

/**
 * Node reputation (Canon §9.8).
 * nodeReputation = (successful / total) × uptimeFactor
 * Standing is participation success — not stake.
 */
export class NodeReputationService {
  private successful = new Map<string, number>();
  private total = new Map<string, number>();
  private uptimeFactor = new Map<string, number>();

  recordParticipation(nodeId: string, success: boolean): void {
    this.total.set(nodeId, (this.total.get(nodeId) ?? 0) + 1);
    if (success) {
      this.successful.set(nodeId, (this.successful.get(nodeId) ?? 0) + 1);
    }
  }

  setUptimeFactor(nodeId: string, factor: number): void {
    const f = Math.min(1, Math.max(0, factor));
    this.uptimeFactor.set(nodeId, f);
  }

  reputation(nodeId: string): number {
    const total = this.total.get(nodeId) ?? 0;
    if (total === 0) return 0;
    const ok = this.successful.get(nodeId) ?? 0;
    const up = this.uptimeFactor.get(nodeId) ?? 1;
    return (ok / total) * up;
  }

  /** Weight for payment/quorum hints — reputation scaled to [0,1], min dust weight. */
  weight(nodeId: string): number {
    const r = this.reputation(nodeId);
    return r > 0 ? r : 0.000001;
  }

  snapshot(nodeId: string): ReputationSnapshot {
    return {
      nodeId,
      successful: this.successful.get(nodeId) ?? 0,
      total: this.total.get(nodeId) ?? 0,
      uptimeFactor: this.uptimeFactor.get(nodeId) ?? 1,
      reputation: this.reputation(nodeId),
    };
  }

  listSnapshots(): ReputationSnapshot[] {
    const ids = new Set([...this.total.keys(), ...this.successful.keys()]);
    return [...ids].map((id) => this.snapshot(id)).sort((a, b) => a.nodeId.localeCompare(b.nodeId));
  }
}
