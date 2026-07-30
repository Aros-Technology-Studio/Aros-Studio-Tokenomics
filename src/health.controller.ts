import { Controller, Get, Header, Inject, Optional } from '@nestjs/common';
import { globalKillSwitch } from './hardening/kill-switch';
import { NodechainService } from './nodechain/nodechain.service';
import { eventOutConfigured } from './event-stream/event-out-bridge';

const startedAt = Date.now();

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
      uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
      databaseUrlSet: Boolean(process.env.DATABASE_URL?.trim()),
      eventOutConfigured: eventOutConfigured(),
    };
  }

  /**
   * I7 — Prometheus text exposition (minimal). Journal height + health gauges.
   * Scrape: GET /metrics
   */
  @Get('metrics')
  @Header('content-type', 'text/plain; version=0.0.4; charset=utf-8')
  async metrics(): Promise<string> {
    let height = -1;
    let chainOk = 0;
    if (this.nodechain) {
      const tip = await this.nodechain.getTip();
      height = tip?.height ?? -1;
      const v = await this.nodechain.verifyChain();
      chainOk = v.ok ? 1 : 0;
    }
    const kill = globalKillSwitch.isEngaged() ? 1 : 0;
    const lines = [
      '# HELP ast_up 1 if process is serving',
      '# TYPE ast_up gauge',
      'ast_up 1',
      '# HELP ast_kill_switch 1 if kill switch engaged',
      '# TYPE ast_kill_switch gauge',
      `ast_kill_switch ${kill}`,
      '# HELP ast_journal_height NodeChain tip height (-1 if unavailable)',
      '# TYPE ast_journal_height gauge',
      `ast_journal_height ${height}`,
      '# HELP ast_chain_ok 1 if full chain verify ok',
      '# TYPE ast_chain_ok gauge',
      `ast_chain_ok ${chainOk}`,
      '# HELP ast_uptime_seconds Process uptime',
      '# TYPE ast_uptime_seconds counter',
      `ast_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`,
      '',
    ];
    return lines.join('\n');
  }

  @Get()
  root() {
    return {
      name: 'AST',
      docs: 'docs/AST-CORE-CANON.md',
      layers: 'docs/layers/',
      infra: 'docs/infra/BLOCK-I.md',
      nodechain: '/v1/core/nodechain/status',
      metrics: '/metrics',
      cli: 'npm run cli -- journal status',
    };
  }
}
