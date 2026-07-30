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
import { INDEX_MIRROR } from '../layers.module';
import type { IndexMirror } from '../index-mirror/index-mirror';
import { timingSafeEqual } from 'crypto';

/**
 * Index mirror ops API — secondary only. NodeChain remains SoT (B6).
 */
@Controller('v1/core/mirror')
export class CoreMirrorController {
  constructor(
    @Inject(INDEX_MIRROR) private readonly mirror: IndexMirror,
    @Inject(NodechainService) private readonly nodechain: NodechainService,
  ) {}

  private assertOps(opsToken?: string): void {
    const expected = process.env.AST_OPS_READ_TOKEN?.trim();
    if (!expected) return; // open when ops token not configured (local)
    if (!opsToken?.trim()) {
      throw new HttpException(
        { code: 'E_UNAUTHORIZED', message: 'X-Ops-Token required for mirror ops' },
        401,
      );
    }
    const a = Buffer.from(expected);
    const b = Buffer.from(opsToken.trim());
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new HttpException(
        { code: 'E_UNAUTHORIZED', message: 'invalid ops token' },
        401,
      );
    }
  }

  @Get('status')
  async status(@Headers('x-ops-token') opsToken?: string) {
    this.assertOps(opsToken);
    const status = this.mirror.getStatus
      ? await this.mirror.getStatus(this.nodechain)
      : {
          kind: this.mirror.kind,
          role: 'index_mirror_not_sot' as const,
          ready: true,
        };
    return {
      ...status,
      sot: 'nodechain',
      note: 'Mirror is not source of truth. On conflict, journal wins.',
    };
  }

  @Post('replay')
  async replay(@Headers('x-ops-token') opsToken?: string) {
    this.assertOps(opsToken);
    const result = await this.mirror.replayFrom(this.nodechain);
    const status = this.mirror.getStatus
      ? await this.mirror.getStatus(this.nodechain)
      : null;
    return { ok: true, action: 'replay', ...result, status };
  }

  @Get('processes/:processId')
  async byProcess(
    @Param('processId') processId: string,
    @Headers('x-ops-token') opsToken?: string,
    @Query('limit') limitRaw?: string,
  ) {
    this.assertOps(opsToken);
    if (!processId?.trim()) {
      throw new HttpException({ code: 'E_SCHEMA', message: 'processId required' }, 422);
    }
    const all = await this.mirror.getByProcessId(processId.trim());
    const limit = Math.min(500, Math.max(1, Number(limitRaw ?? 100) || 100));
    const records = all.slice(-limit);
    return {
      processId: processId.trim(),
      count: all.length,
      returned: records.length,
      records,
      source: 'index_mirror',
      sot: 'nodechain',
    };
  }
}
