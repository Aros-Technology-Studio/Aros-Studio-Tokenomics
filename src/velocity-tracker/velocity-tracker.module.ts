import { Module } from '@nestjs/common';
import { VelocityTrackerService } from './velocity-tracker.service';

@Module({
  providers: [VelocityTrackerService],
  exports: [VelocityTrackerService],
})
export class VelocityTrackerModule {}
