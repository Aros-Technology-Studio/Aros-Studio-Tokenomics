import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { NodechainService } from '../nodechain/nodechain.service';
import { NodeChainError } from '../nodechain/errors';
import { globalKillSwitch } from '../hardening/kill-switch';

/**
 * Core HTTP surface for NodeChain (SoT journal).
 *
 * Read/verify endpoints are the public operational API.
 * Append remains internal (services / orchestrator) — no open mint or free-form write surface.
 *
 * Routes under /v1/core/nodechain/*
 */
@Controller('v1/core/nodechain')
export class CoreNodechainController {
  constructor(@Inject(NodechainService) private readonly nodechain: NodechainService) {}

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
   * Latest blocks (tip-first), like a blockchain explorer feed.
   * Each journal record is one block: height = block number, prevHash = parent.
   */
  @Get('blocks')
  async recentBlocks(@Query('limit') limitRaw?: string) {
    const limit = Math.min(200, Math.max(1, Number(limitRaw ?? 25) || 25));
    const blocks = await this.nodechain.listRecent(limit);
    const tip = await this.nodechain.getTip();
    return {
      tip,
      count: blocks.length,
      blocks: blocks.map((r) => ({
        blockNumber: r.height,
        blockHash: r.envelopeHash,
        parentHash: r.prevHash,
        timestamp: r.timestampUtc,
        type: r.recordType,
        processId: r.processId,
        writer: r.writerId,
        writerRole: r.writerRole,
        recordId: r.recordId,
        record: r,
      })),
    };
  }

  @Get('records/height/:height')
  async byHeight(@Param('height') heightRaw: string) {
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
    return { record };
  }

  @Get('records/id/:recordId')
  async byRecordId(@Param('recordId') recordId: string) {
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
    return { record };
  }

  @Get('processes/:processId')
  async byProcess(
    @Param('processId') processId: string,
    @Query('limit') limitRaw?: string,
  ) {
    if (!processId?.trim()) {
      throw new HttpException({ code: 'E_SCHEMA', message: 'processId required' }, 422);
    }
    const all = await this.nodechain.listByProcessId(processId.trim());
    const limit = Math.min(500, Math.max(1, Number(limitRaw ?? 100) || 100));
    const records = all.slice(-limit);
    return {
      processId: processId.trim(),
      count: all.length,
      returned: records.length,
      records,
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
