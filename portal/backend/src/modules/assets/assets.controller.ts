import { Controller, Get, Param } from '@nestjs/common';

@Controller('assets')
export class AssetsController {
  @Get()
  list(): unknown[] {
    // Own institution assets only — enforced when auth context is wired.
    return [];
  }

  @Get(':claimId')
  get(@Param('claimId') claimId: string): {
    claimId: string;
    note: string;
  } {
    return {
      claimId,
      note: 'Stub — load claim from core read models (own scope only)',
    };
  }
}
