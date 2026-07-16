import { Global, Module } from '@nestjs/common';

/** Technical utilities only — no domain rules (common pack). */
@Global()
@Module({})
export class CommonModule {}
