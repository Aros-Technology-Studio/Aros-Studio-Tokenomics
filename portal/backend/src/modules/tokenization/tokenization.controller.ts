import { Body, Controller, Post } from '@nestjs/common';
import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Edge: validates request and will call core Orchestrator StartProcess.
 * Stub responses until Orchestrator client is wired.
 */

class StartTokenizationDto {
  @IsIn(['real_estate', 'bond', 'investment_package', 'other'])
  assetType!: 'real_estate' | 'bond' | 'investment_package' | 'other';

  /** Institutional valuation — AST does not compute this. */
  @IsString()
  @MinLength(1)
  institutionalValuation!: string;

  @IsString()
  @MinLength(1)
  currency!: string;

  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

@Controller('tokenization')
export class TokenizationController {
  @Post('start')
  start(@Body() body: StartTokenizationDto): {
    processId: string;
    status: string;
    createdAt: string;
    currentStep: string;
    note: string;
  } {
    // TODO: call core Orchestrator StartProcess (sole economic entry).
    // processId pattern: AST-{INST}-{YYYYMMDD}-<UUIDv7>
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const processId = `AST-PENDING-${day}-stub`;

    void body;

    return {
      processId,
      status: 'created',
      createdAt: new Date().toISOString(),
      currentStep: 'StartProcess',
      note: 'Stub — wire Orchestrator client before production use',
    };
  }
}
