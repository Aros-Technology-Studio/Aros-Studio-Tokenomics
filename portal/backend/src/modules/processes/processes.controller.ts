import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

@Controller('processes')
export class ProcessesController {
  @Get(':processId')
  get(@Param('processId') processId: string): {
    processId: string;
    status: string;
    createdAt: string;
    currentStep: string;
    claimId: string | null;
    note: string;
  } {
    if (!processId?.startsWith('AST-')) {
      throw new NotFoundException('process not found');
    }

    return {
      processId,
      status: 'documents_pending',
      createdAt: new Date().toISOString(),
      currentStep: 'DocumentValidation',
      claimId: null,
      note: 'Stub — load from Orchestrator / state-recording (own scope only)',
    };
  }
}
