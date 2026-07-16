import { Injectable } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { AstNode, NodeRole, RegisterNodeInput } from './nodes.types';

/** Default min uptime 95% (nodes pack / CANON defaults). */
export const DEFAULT_MIN_UPTIME = 0.95;

/**
 * Node registry: dual identity (cert + key), manual approval + allowlist,
 * fixed roles, heartbeats, multi-node per institution.
 */
@Injectable()
export class NodesService {
  private readonly nodes = new Map<string, AstNode>();
  private readonly certToInstitution = new Map<string, string>();

  register(input: RegisterNodeInput): AstNode {
    if (!input.allowlisted || !input.approved) {
      throw new AstError(
        AstErrorCode.INVALID_INSTITUTION_CODE,
        'manual approval and allowlist required',
      );
    }
    const roles = normalizeRoles(input.roles);
    const node: AstNode = {
      nodeId: input.nodeId,
      institutionId: input.institutionId,
      roles,
      status: 'active',
      publicKey: input.publicKey,
      uptimeRatio: 1,
      jurisdiction: input.jurisdiction,
    };
    this.nodes.set(input.nodeId, node);
    this.certToInstitution.set(input.certificateId, input.institutionId);
    return node;
  }

  heartbeat(nodeId: string, uptimeRatio: number): AstNode {
    const node = this.require(nodeId);
    node.lastHeartbeatAt = new Date().toISOString();
    node.uptimeRatio = uptimeRatio;
    if (uptimeRatio < DEFAULT_MIN_UPTIME && node.status === 'active') {
      node.status = 'suspended';
    }
    return node;
  }

  suspend(nodeId: string): AstNode {
    const node = this.require(nodeId);
    node.status = 'suspended';
    return node;
  }

  restore(nodeId: string): AstNode {
    const node = this.require(nodeId);
    if (node.uptimeRatio >= DEFAULT_MIN_UPTIME) {
      node.status = 'active';
    }
    return node;
  }

  /** Nodes eligible for PoT confirmer quorum (active confirmers). */
  activeConfirmers(): AstNode[] {
    return [...this.nodes.values()].filter(
      (n) => n.status === 'active' && n.roles.includes('confirmer'),
    );
  }

  /**
   * One vote per institutional certificate (P4).
   * Returns unique institutionIds among active confirmers.
   */
  institutionalVoterIds(): string[] {
    const set = new Set(
      this.activeConfirmers().map((n) => n.institutionId),
    );
    return [...set];
  }

  listByInstitution(institutionId: string): AstNode[] {
    return [...this.nodes.values()].filter((n) => n.institutionId === institutionId);
  }

  get(nodeId: string): AstNode | undefined {
    return this.nodes.get(nodeId);
  }

  private require(nodeId: string): AstNode {
    const n = this.nodes.get(nodeId);
    if (!n) {
      throw new AstError(AstErrorCode.INVALID_PROCESS_ID, 'node not found');
    }
    return n;
  }
}

function normalizeRoles(roles: NodeRole[]): NodeRole[] {
  const allowed: NodeRole[] = ['executor', 'confirmer', 'observer'];
  const out = roles.filter((r) => allowed.includes(r));
  if (out.length === 0) {
    throw new AstError(AstErrorCode.INVALID_AMOUNT, 'at least one fixed role required');
  }
  return out;
}
