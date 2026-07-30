import {
  Controller,
  Get,
  Headers,
  HttpException,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { NodechainService } from '../nodechain/nodechain.service';
import { NodeChainError } from '../nodechain/errors';
import { globalKillSwitch } from '../hardening/kill-switch';
import { InstitutionAuthService } from '../intake/institution-auth';
import {
  assertCanReadProcess,
  assertCanReadRecord,
  filterNodesForPrincipal,
  publicNodechainReadEnabled,
  resolveReadPrincipal,
} from './read-scope';

/**
 * Core HTTP surface for NodeChain (SoT journal).
 *
 * Read/verify endpoints are the operational API with institution read scoping (B3).
 * Append remains internal (services / orchestrator) — no open mint or free-form write surface.
 *
 * Routes under /v1/core/nodechain/*
 */
@Controller('v1/core/nodechain')
export class CoreNodechainController {
  private readonly auth = new InstitutionAuthService();

  constructor(@Inject(NodechainService) private readonly nodechain: NodechainService) {}

  private principal(headers: {
    institutionId?: string;
    institutionToken?: string;
    opsToken?: string;
  }) {
    return resolveReadPrincipal(headers, this.auth);
  }

  /** Operational status: tip, genesis, chain integrity, kill-switch. */
  @Get('status')
  async status() {
    const s = await this.nodechain.getStatus();
    return {
      service: 'nodechain',
      engine: process.env.AST_JOURNAL_ENGINE ?? 'file',
      dir: process.env.AST_JOURNAL_DIR ?? 'data/journal',
      ...s,
      killSwitchReason: globalKillSwitch.getReason(),
    };
  }

  @Get('tip')
  async tip() {
    const tip = await this.nodechain.getTip();
    return { tip };
  }

  @Get('verify')
  async verify() {
    const chain = await this.nodechain.verifyChain();
    if (!chain.ok) {
      throw new HttpException(
        { code: 'E_HASH_MISMATCH', message: chain.error ?? 'chain broken', height: chain.height },
        409,
      );
    }
    return chain;
  }

  /**
   * ListNodes — chain units (tip-first) for explorer feeds.
   * Not GET /v1/core/nodes (network registry). See nodes-vs-registry.md (B5).
   * Institution: system rows + own processIds only.
   */
  @Get('nodes')
  async listNodes(
    @Query('limit') limitRaw?: string,
    @Headers('x-institution-id') institutionId?: string,
    @Headers('x-institution-token') institutionToken?: string,
    @Headers('x-ops-token') opsToken?: string,
  ) {
    const principal = this.principal({ institutionId, institutionToken, opsToken });
    const limit = Math.min(200, Math.max(1, Number(limitRaw ?? 25) || 25));
    // Over-fetch then filter so institution still gets up to `limit` visible rows
    const fetchLimit =
      principal.kind === 'institution' ||
      (principal.kind === 'anonymous' && !publicNodechainReadEnabled())
        ? Math.min(500, limit * 4)
        : limit;
    const rows = await this.nodechain.listRecent(fetchLimit);
    const tip = await this.nodechain.getTip();
    const mapped = rows.map((r) => ({
      height: r.height,
      envelopeHash: r.envelopeHash,
      prevHash: r.prevHash,
      timestamp: r.timestampUtc,
      type: r.recordType,
      processId: r.processId,
      writer: r.writerId,
      writerRole: r.writerRole,
      recordId: r.recordId,
      payload: r.payload,
    }));
    const scoped = filterNodesForPrincipal(principal, mapped).slice(0, limit);
    return {
      kind: 'chain_nodes_list',
      tip,
      count: scoped.length,
      nodes: scoped,
      scope: principal.kind,
    };
  }

  @Get('records/height/:height')
  async byHeight(
    @Param('height') heightRaw: string,
    @Headers('x-institution-id') institutionId?: string,
    @Headers('x-institution-token') institutionToken?: string,
    @Headers('x-ops-token') opsToken?: string,
  ) {
    const principal = this.principal({ institutionId, institutionToken, opsToken });
    const height = Number(heightRaw);
    if (!Number.isInteger(height) || height < 0) {
      throw new HttpException(
        { code: 'E_SCHEMA', message: 'height must be a non-negative integer' },
        422,
      );
    }
    const record = await this.nodechain.getByHeight(height);
    if (!record) {
      throw new HttpException(
        { code: 'E_NOT_FOUND', message: `no record at height ${height}` },
        404,
      );
    }
    assertCanReadRecord(principal, record);
    return { record, scope: principal.kind };
  }

  @Get('records/id/:recordId')
  async byRecordId(
    @Param('recordId') recordId: string,
    @Headers('x-institution-id') institutionId?: string,
    @Headers('x-institution-token') institutionToken?: string,
    @Headers('x-ops-token') opsToken?: string,
  ) {
    const principal = this.principal({ institutionId, institutionToken, opsToken });
    if (!recordId?.trim()) {
      throw new HttpException({ code: 'E_SCHEMA', message: 'recordId required' }, 422);
    }
    const record = await this.nodechain.getByRecordId(recordId.trim());
    if (!record) {
      throw new HttpException(
        { code: 'E_NOT_FOUND', message: `no record ${recordId}` },
        404,
      );
    }
    assertCanReadRecord(principal, record);
    return { record, scope: principal.kind };
  }

  @Get('processes/:processId')
  async byProcess(
    @Param('processId') processId: string,
    @Query('limit') limitRaw?: string,
    @Headers('x-institution-id') institutionId?: string,
    @Headers('x-institution-token') institutionToken?: string,
    @Headers('x-ops-token') opsToken?: string,
  ) {
    const principal = this.principal({ institutionId, institutionToken, opsToken });
    if (!processId?.trim()) {
      throw new HttpException({ code: 'E_SCHEMA', message: 'processId required' }, 422);
    }
    const pid = processId.trim();
    assertCanReadProcess(principal, pid);
    const all = await this.nodechain.listByProcessId(pid);
    const limit = Math.min(500, Math.max(1, Number(limitRaw ?? 100) || 100));
    const records = all.slice(-limit);
    return {
      processId: pid,
      count: all.length,
      returned: records.length,
      records,
      scope: principal.kind,
    };
  }

  /**
   * Idempotent genesis ensure (same as CLI `journal genesis`).
   * Safe to call repeatedly; does not create a second genesis.
   */
  @Post('genesis')
  async genesis() {
    if (globalKillSwitch.isEngaged()) {
      throw new HttpException(
        { code: 'KILL_SWITCH', message: 'kill-switch engaged — writes disabled' },
        503,
      );
    }
    try {
      const result = await this.nodechain.ensureGenesis('system');
      return { ok: true, action: 'genesis', ...result };
    } catch (e) {
      if (e instanceof NodeChainError) {
        throw new HttpException({ code: e.code, message: e.message }, 409);
      }
      throw e;
    }
  }
}
