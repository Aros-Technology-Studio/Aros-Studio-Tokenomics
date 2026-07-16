export type NodeRole = 'executor' | 'confirmer' | 'observer';

export type NodeStatus = 'pending_approval' | 'active' | 'suspended' | 'retired';

export interface Institution {
  institutionId: string;
  certificateId: string;
  allowlisted: boolean;
  approved: boolean;
}

export interface AstNode {
  nodeId: string;
  institutionId: string;
  roles: NodeRole[];
  status: NodeStatus;
  publicKey: string;
  lastHeartbeatAt?: string;
  uptimeRatio: number;
  jurisdiction?: string;
}

export interface RegisterNodeInput {
  nodeId: string;
  institutionId: string;
  certificateId: string;
  publicKey: string;
  roles: NodeRole[];
  jurisdiction?: string;
  /** Must be pre-allowlisted + manual approval for v1. */
  approved: boolean;
  allowlisted: boolean;
}
