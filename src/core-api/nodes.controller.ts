import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NodeRegistryService } from '../nodes/node-registry.service';
import { NodeReputationService } from '../nodes/node-reputation.service';
import type { NodeRole } from '../nodes/types';

/**
 * Network participant registry (writers / validators / observers).
 * Not the chain Nodes list — that is GET /v1/core/nodechain/nodes (ListNodes).
 * See docs/layers/01_NodeChain/08_api/nodes-vs-registry.md (B5).
 */
@Controller('v1/core/nodes')
export class CoreNodesController {
  constructor(
    private readonly registry: NodeRegistryService,
    private readonly reputation: NodeReputationService,
  ) {}

  @Get()
  list() {
    return {
      kind: 'network_registry',
      nodes: this.registry.list(),
      reputations: this.reputation.listSnapshots(),
      note: 'Network participants — not NodeChain journal heights. Chain feed: GET /v1/core/nodechain/nodes',
    };
  }

  @Get(':nodeId')
  get(@Param('nodeId') nodeId: string) {
    const node = this.registry.get(nodeId);
    if (!node) {
      return { found: false, nodeId };
    }
    return {
      found: true,
      node,
      reputation: this.reputation.snapshot(nodeId),
    };
  }

  @Post('register')
  async register(
    @Body() body: { nodeId: string; role: NodeRole; institutionId?: string },
  ) {
    const node = await this.registry.register(body);
    return { node };
  }

  @Post(':nodeId/heartbeat')
  heartbeat(@Param('nodeId') nodeId: string) {
    this.registry.heartbeat(nodeId);
    return { ok: true, nodeId, at: new Date().toISOString() };
  }
}
