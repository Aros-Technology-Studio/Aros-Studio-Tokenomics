import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { coreStartProcess } from '../../core-client';

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

  @IsString()
  @MinLength(2)
  institutionCode!: string;

  @IsString()
  @MinLength(1)
  holderId!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

@Controller('tokenization')
export class TokenizationController {
  @Post('start')
  async start(@Body() body: StartTokenizationDto): Promise<{
    processId: string;
    status: string;
    createdAt: string;
    currentStep: string;
  }> {
    try {
      const r = await coreStartProcess({
        institutionCode: body.institutionCode,
        idempotencyKey: body.idempotencyKey,
        institutionalValuation: body.institutionalValuation,
        currency: body.currency,
        assetType: body.assetType,
        holderId: body.holderId,
      });
      return {
        processId: r.processId,
        status: r.status,
        createdAt: r.createdAt,
        currentStep: r.currentStep,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'core unavailable';
      throw new BadRequestException(msg);
    }
  }
}
