import {
  Controller,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { coreGetProcess } from '../../core-client';

@Controller('processes')
export class ProcessesController {
  @Get(':processId')
  async get(@Param('processId') processId: string): Promise<unknown> {
    if (!processId?.startsWith('AST-')) {
      throw new NotFoundException('process not found');
    }
    try {
      return await coreGetProcess(processId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'core unavailable';
      throw new BadRequestException(msg);
    }
  }
}
