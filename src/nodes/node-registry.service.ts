import { NodechainService } from '../nodechain/nodechain.service';
import type { NodeRecord, NodeRole, NodeStatus } from './types';

const DEFAULT_GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Node registry — cert/key admission surface (v1: explicit register).
 * Suspend = reputation + quorum exclude + grace (no slashing).
 */
export class NodeRegistryService {
  private readonly byId = new Map<string, NodeRecord>();
  private readonly graceMs: number;

  constructor(
    private readonly nodechain?: NodechainService,
    opts?: { graceMs?: number },
  ) {
    this.graceMs = opts?.graceMs ?? DEFAULT_GRACE_MS;
  }

  async register(input: {
    nodeId: string;
    role: NodeRole;
    institutionId?: string;
  }): Promise<NodeRecord> {
    if (!input.nodeId?.trim()) throw new Error('nodeId required');
    const existing = this.byId.get(input.nodeId);
    if (existing && existing.status === 'active') {
      return existing;
    }
    const row: NodeRecord = {
      nodeId: input.nodeId.trim(),
      role: input.role,
      status: 'active',
      institutionId: input.institutionId,
      registeredAtUtc: new Date().toISOString(),
      lastHeartbeatUtc: new Date().toISOString(),
    };
    this.byId.set(row.nodeId, row);
    if (this.nodechain) {
      await this.nodechain.append({
        clientRecordId: `node-register:${row.nodeId}`,
        recordType: 'node_register',
        processId: null,
        payload: {
          nodeId: row.nodeId,
          role: row.role,
          institutionId: row.institutionId,
        },
        writerId: 'system',
        writerRole: 'system',
      });
    }
    return { ...row };
  }

  registerMany(ids: string[], role: NodeRole = 'confirmer'): void {
    for (const id of ids) {
      if (!this.byId.has(id)) {
        this.byId.set(id, {
          nodeId: id,
          role,
          status: 'active',
          registeredAtUtc: new Date().toISOString(),
          lastHeartbeatUtc: new Date().toISOString(),
        });
      }
    }
  }

  async suspend(nodeId: string, reason: string): Promise<NodeRecord> {
    const row = this.require(nodeId);
    row.status = 'suspended';
    row.suspendedAtUtc = new Date().toISOString();
    row.suspendReason = reason;
    row.graceUntilUtc = new Date(Date.now() + this.graceMs).toISOString();
    if (this.nodechain) {
      await this.nodechain.append({
        clientRecordId: `node-suspend:${nodeId}:${Date.now()}`,
        recordType: 'node_suspend',
        processId: null,
        payload: { nodeId, reason, graceUntilUtc: row.graceUntilUtc },
        writerId: 'system',
        writerRole: 'system',
      });
    }
    return { ...row };
  }

  async restore(nodeId: string): Promise<NodeRecord> {
    const row = this.require(nodeId);
    row.status = 'active';
    row.suspendedAtUtc = undefined;
    row.suspendReason = undefined;
    row.graceUntilUtc = undefined;
    if (this.nodechain) {
      await this.nodechain.append({
        clientRecordId: `node-restore:${nodeId}:${Date.now()}`,
        recordType: 'node_restore',
        processId: null,
        payload: { nodeId },
        writerId: 'system',
        writerRole: 'system',
      });
    }
    return { ...row };
  }

  heartbeat(nodeId: string): void {
    const row = this.require(nodeId);
    row.lastHeartbeatUtc = new Date().toISOString();
  }

  isActive(nodeId: string): boolean {
    return this.byId.get(nodeId)?.status === 'active';
  }

  get(nodeId: string): NodeRecord | undefined {
    const r = this.byId.get(nodeId);
    return r ? { ...r } : undefined;
  }

  list(status?: NodeStatus): NodeRecord[] {
    return [...this.byId.values()]
      .filter((n) => (status ? n.status === status : true))
      .map((n) => ({ ...n }))
      .sort((a, b) => a.nodeId.localeCompare(b.nodeId));
  }

  listActiveIds(role?: NodeRole): string[] {
    return this.list('active')
      .filter((n) => (role ? n.role === role : true))
      .map((n) => n.nodeId);
  }

  /** Eligible confirmers for PoT — active confirmer/executor only. */
  resolveEligibleConfirmers(proposed: string[]): string[] {
    if (this.byId.size === 0) return [...new Set(proposed)];
    return [...new Set(proposed)].filter(
      (id) =>
        this.isActive(id) &&
        (this.byId.get(id)?.role === 'confirmer' ||
          this.byId.get(id)?.role === 'executor'),
    );
  }

  private require(nodeId: string): NodeRecord {
    const row = this.byId.get(nodeId);
    if (!row) throw new Error(`unknown node ${nodeId}`);
    return row;
  }
}
