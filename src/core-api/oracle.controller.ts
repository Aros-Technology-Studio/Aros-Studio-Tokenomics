import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import type { OraclePackage } from '../oracle-gateway/types';
import { OracleError } from '../oracle-gateway/errors';

@Controller('v1/core/oracle')
export class CoreOracleController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Get()
  list() {
    return {
      oracles: this.orchestrator.oracle.listOracles(),
      minOracles: 2,
      mode: 'multi-oracle-ed25519-fail-closed',
    };
  }

  @Post('verify')
  verify(@Body() body: OraclePackage) {
    try {
      const r = this.orchestrator.oracle.require(body);
      return r;
    } catch (e) {
      if (e instanceof OracleError) {
        throw new HttpException(
          { code: e.code, message: e.message, details: e.details },
          422,
        );
      }
      throw e;
    }
  }
}
