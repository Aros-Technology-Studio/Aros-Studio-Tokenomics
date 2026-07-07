import { Controller, Get } from '@nestjs/common';

/**
 * Health surface of the scaffold. The real AST modules (NodeChain, PoT,
 * token management, reserve, the All-Seeing Eye) arrive with the
 * migration phases tracked in PROJECT_STATUS.md.
 */
@Controller()
export class AppController {
  @Get('health')
  health(): { status: string; project: string } {
    return { status: 'ok', project: 'aros-studio-tokenomics' };
  }
}
