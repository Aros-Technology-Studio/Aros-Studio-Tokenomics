import { Controller, Get } from '@nestjs/common';

/** Health surface of the scaffold. */
@Controller()
export class AppController {
  @Get('health')
  health(): { status: string; project: string } {
    return { status: 'ok', project: 'aros-studio-tokenomics' };
  }
}
