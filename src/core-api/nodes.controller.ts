import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NodeRegistryService } from '../nodes/node-registry.service';
import { NodeReputationService } from '../nodes/node-reputation.service';
import type { NodeRole } from '../nodes/types';

@Controller('v1/core/nodes')
export class CoreNodesController {
  constructor(
    private readonly registry: NodeRegistryService,
    private readonly reputation: NodeReputationService,
  ) {}

  @Get()
  list() {
    return {
      nodes: this.registry.list(),
      reputations: this.reputation.listSnapshots(),
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
