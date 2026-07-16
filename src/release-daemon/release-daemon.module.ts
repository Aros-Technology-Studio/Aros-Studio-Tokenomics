import { Module } from '@nestjs/common';
import { ReleaseModule } from '../release/release.module';
import { ReserveModule } from '../reserve/reserve.module';
import { VelocityTrackerModule } from '../velocity-tracker/velocity-tracker.module';
import { ReleaseDaemonService } from './release-daemon.service';

@Module({
  imports: [ReserveModule, VelocityTrackerModule, ReleaseModule],
  providers: [ReleaseDaemonService],
  exports: [ReleaseDaemonService],
})
export class ReleaseDaemonModule {}
