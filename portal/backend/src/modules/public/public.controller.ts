import { Controller, Get, HttpException, Inject, Param } from '@nestjs/common';
import { ProcessesService } from '../processes/processes.service';

/**
 * Public, unauthenticated read API — external transparency.
 * No registration, no institution key. No write / mint.
 */
@Controller('v1/public')
export class PublicController {
  constructor(
    @Inject(ProcessesService) private readonly processes: ProcessesService,
  ) {}

  @Get('processes/:processId')
  async getProcess(@Param('processId') processId: string) {
    if (!processId?.trim()) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'processId required' },
        400,
      );
    }
    const result = await this.processes.getPublic(processId.trim());
    if (result.statusCode >= 400) {
      throw new HttpException(result.body, result.statusCode);
    }
    return result.body;
  }

  @Get('info')
  info() {
    return {
      product: 'Aros Financial Core',
      role: 'Public face of AST + institutional edge cabinet',
      system: 'Aros Studio Tokenomics (AST)',
      publicExplorer: true,
      registrationRequiredForLookup: false,
      mintOnPortal: false,
      sourceOfTruth: 'NodeChain (via Core Orchestrator after PoT)',
      whatWeDo: [
        'Accept institutional valuation packages (allowlisted institutions)',
        'Hand off to Core Orchestrator for PoT-gated economic path',
        'Expose public read-only process lookup',
        'Explain system boundaries to the outside world',
      ],
      whatWeDoNot: [
        'Appraise assets',
        'Mint or burn ARO in the portal',
        'Hold third-party funds or act as a bank/custodian',
        'Let the public write to NodeChain',
        'Replace institutional certificates with free self-signup',
      ],
    };
  }
}
