import {
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Query,
} from '@nestjs/common';
import { NodechainPublicService } from './nodechain-public.service';

/**
 * Public NodeChain explorer API — unauthenticated, read-only.
 * Proxies Core `/v1/core/nodechain/*`. No append / mint / genesis.
 */
@Controller('v1/public/nodechain')
export class NodechainPublicController {
  constructor(
    @Inject(NodechainPublicService) private readonly nodechain: NodechainPublicService,
  ) {}

  private async respond(
    result: Promise<{ statusCode: number; body: Record<string, unknown> }>,
  ) {
    const r = await result;
    if (r.statusCode >= 400) {
      throw new HttpException(r.body, r.statusCode);
    }
    return {
      ...r.body,
      public: true,
      write: false,
      mint: false,
      source: 'NodeChain via Core (read-only edge proxy)',
    };
  }

  @Get('status')
  status() {
    return this.respond(this.nodechain.status());
  }

  /** Latest NodeChain nodes — tip-first feed (read-only). Not network registry. */
  @Get('nodes')
  nodes(@Query('limit') limitRaw?: string) {
    const limit = limitRaw != null ? Number(limitRaw) : 40;
    return this.respond(this.nodechain.nodes(limit));
  }

  @Get('tip')
  tip() {
    return this.respond(this.nodechain.tip());
  }

  @Get('verify')
  verify() {
    return this.respond(this.nodechain.verify());
  }

  @Get('records/height/:height')
  byHeight(@Param('height') heightRaw: string) {
    const height = Number(heightRaw);
    if (!Number.isInteger(height) || height < 0) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'height must be a non-negative integer' },
        400,
      );
    }
    return this.respond(this.nodechain.byHeight(height));
  }

  @Get('records/id/:recordId')
  byRecordId(@Param('recordId') recordId: string) {
    if (!recordId?.trim()) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'recordId required' },
        400,
      );
    }
    return this.respond(this.nodechain.byRecordId(recordId.trim()));
  }

  @Get('processes/:processId')
  byProcess(
    @Param('processId') processId: string,
    @Query('limit') limitRaw?: string,
  ) {
    if (!processId?.trim()) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'processId required' },
        400,
      );
    }
    const limit = limitRaw != null ? Number(limitRaw) : undefined;
    return this.respond(this.nodechain.byProcess(processId.trim(), limit));
  }
}
