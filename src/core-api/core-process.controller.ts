import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

/**
 * Core HTTP surface for Portal edge and internal clients.
 * Prefix applied in main: none here — AppModule mounts at root; portal uses /v1/core/...
 */
@Controller('core/processes')
export class CoreProcessController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Post('start')
  start(@Body() body: StartDto) {
    const r = this.orchestrator.startProcess(body);
    return {
      processId: r.processId,
      status: 'created',
      currentStep: r.step,
      createdAt: new Date().toISOString(),
    };
  }

  @Post(':processId/run-pot')
  runPot(@Param('processId') processId: string, @Body() body: RunPotDto) {
    return this.orchestrator.runFromPot(
      processId,
      body.criteria,
      body.nodeWeights ?? { default: '1' },
    );
  }

  @Get(':processId')
  get(@Param('processId') processId: string) {
    return {
      processId,
      note: 'status snapshot — extend with process store read',
    };
  }
}
