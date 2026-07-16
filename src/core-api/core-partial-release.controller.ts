import { Body, Controller, Post } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialReleaseService } from '../partial-release/partial-release.service';

class PartialReleaseDto {
  @IsString()
  holderId!: string;

  @IsString()
  institutionCode!: string;

  @IsBoolean()
  institutionalApproval!: boolean;

  @IsString()
  amountAro!: string;

  @IsString()
  sourceClaimId!: string;

  @IsString()
  @MinLength(8)
  idempotencyKey!: string;

  @IsString()
  institutionalValuation!: string;

  @IsString()
  currency!: string;

  @IsOptional()
  @IsBoolean()
  externalIntent?: boolean;
}

@Controller('core/partial-release')
export class CorePartialReleaseController {
  constructor(private readonly partialRelease: PartialReleaseService) {}

  @Post()
  request(@Body() body: PartialReleaseDto) {
    return this.partialRelease.request(body);
  }
}
