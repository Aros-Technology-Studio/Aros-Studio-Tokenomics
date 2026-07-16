import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InvariantsService } from './invariants.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [InvariantsService],
  exports: [InvariantsService],
})
export class InvariantsModule {}
