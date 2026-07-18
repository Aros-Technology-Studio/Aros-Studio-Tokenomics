import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import type { AttachDocumentsBody, CreateProcessBody } from '../shared-bridge';
import { ProcessesService } from './processes.service';

@Controller('v1/processes')
export class ProcessesController {
  constructor(private readonly processes: ProcessesService) {}

  @Post()
  async create(
    @Body() body: CreateProcessBody,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('x-institution-id') institutionId: string | undefined,
  ) {
    const result = await this.processes.create(body, institutionId, idempotencyKey);
    if (result.statusCode >= 400) {
      throw new HttpException(result.body, result.statusCode);
    }
    return result.body;
  }

  @Get(':processId')
  async get(
    @Param('processId') processId: string,
    @Headers('x-institution-id') institutionId: string | undefined,
  ) {
    const result = await this.processes.get(processId, institutionId);
    if (result.statusCode >= 400) {
      throw new HttpException(result.body, result.statusCode);
    }
    return result.body;
  }

  @Post(':processId/documents')
  async attachDocuments(
    @Param('processId') processId: string,
    @Body() body: AttachDocumentsBody,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('x-institution-id') institutionId: string | undefined,
  ) {
    const result = await this.processes.attachDocuments(
      processId,
      body,
      institutionId,
      idempotencyKey,
    );
    if (result.statusCode >= 400) {
      throw new HttpException(result.body, result.statusCode);
    }
    return result.body;
  }
}
