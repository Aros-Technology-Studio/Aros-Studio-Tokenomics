import { Controller, Get } from '@nestjs/common';
import { globalKillSwitch } from './hardening/kill-switch';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      ok: true,
      service: 'aros-studio-tokenomics',
      killSwitch: globalKillSwitch.isEngaged(),
      journalEngine: process.env.AST_JOURNAL_ENGINE ?? 'unset' };
  }

  @Get()
  root() {
    return {
      name: 'AST',
      docs: 'docs/AST-CORE-CANON.md',
      layers: 'docs/layers/',
      cli: 'npm run demo:tokenize' };
  }
}
