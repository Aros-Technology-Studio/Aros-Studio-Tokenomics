import { Global, Module } from '@nestjs/common';
import { KillSwitchService } from './kill-switch.service';

/** Technical utilities only — no domain rules (common pack). */
@Global()
@Module({
  providers: [KillSwitchService],
  exports: [KillSwitchService],
})
export class CommonModule {}
