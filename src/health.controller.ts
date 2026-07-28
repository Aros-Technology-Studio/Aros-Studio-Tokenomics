import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { globalKillSwitch } from './hardening/kill-switch';
import { NodechainService } from './nodechain/nodechain.service';

@Controller()
export class HealthController {
  constructor(
    @Optional() @Inject(NodechainService) private readonly nodechain?: NodechainService,
  ) {}

  @Get('health')
  async health() {
    let tip: { height: number; tipHash: string } | null = null;
    let chainOk: boolean | null = null;
    if (this.nodechain) {
      tip = await this.nodechain.getTip();
      const v = await this.nodechain.verifyChain();
      chainOk = v.ok;
    }
    return {
      ok: true,
      service: 'aros-studio-tokenomics',
      killSwitch: globalKillSwitch.isEngaged(),
      journalEngine: process.env.AST_JOURNAL_ENGINE ?? 'unset',
      tip,
      chainOk,
    };
  }

  @Get()
  root() {
    return {
      name: 'AST',
      docs: 'docs/AST-CORE-CANON.md',
      layers: 'docs/layers/',
      nodechain: '/v1/core/nodechain/status',
      cli: 'npm run cli -- journal status',
    };
  }
}
