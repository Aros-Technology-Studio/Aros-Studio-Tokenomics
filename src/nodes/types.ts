/** Node roles (P0–P4): executor, confirmer, observer — not stake-weighted. */
export type NodeRole = 'executor' | 'confirmer' | 'observer';

export type NodeStatus = 'active' | 'suspended';

export interface NodeRecord {
  nodeId: string;
  role: NodeRole;
  status: NodeStatus;
  institutionId?: string;
  registeredAtUtc: string;
  lastHeartbeatUtc?: string;
  suspendedAtUtc?: string;
  suspendReason?: string;
  /** Grace deadline after suspend (Canon: 24h default). */
  graceUntilUtc?: string;
}

export interface ReputationSnapshot {
  nodeId: string;
  successful: number;
  total: number;
  uptimeFactor: number;
  /** Canon §9.8: (successful/total) × uptimeFactor */
  reputation: number;
}
