import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { CriteriaResult } from '../pot/pot.types';

class StartDto {
  @IsString()
  @MinLength(2)
  institutionCode!: string;

  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  @IsString()
  institutionalValuation!: string;

  @IsString()
  currency!: string;

  @IsString()
  assetType!: string;

  @IsString()
  holderId!: string;
}

class RunPotDto {
  @IsObject()
  criteria!: CriteriaResult;

  @IsOptional()
  @IsObject()
  nodeWeights?: Record<string, string>;
}

@Controller('core/processes')
export class CoreProcessController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Post('start')
  start(@Body() body: StartDto) {
    const r = this.orchestrator.startProcess(body);
    const snap = this.orchestrator.getProcess(r.processId)!;
    return {
      processId: r.processId,
      status: snap.status,
      currentStep: r.step,
      createdAt: snap.createdAt,
    };
  }

  @Post(':processId/run-pot')
  runPot(@Param('processId') processId: string, @Body() body: RunPotDto) {
    return this.orchestrator.runFromPot(
      processId,
      body.criteria,
      body.nodeWeights ?? { n1: '1', n2: '1', n3: '1' },
    );
  }

  @Get(':processId')
  get(@Param('processId') processId: string) {
    const snap = this.orchestrator.getProcess(processId);
    if (!snap) throw new NotFoundException('process not found');
    return snap;
  }
}
