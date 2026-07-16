import { Module } from '@nestjs/common';
import { NodechainModule } from '../nodechain/nodechain.module';
import { StateRecordingService } from './state-recording.service';

@Module({
  imports: [NodechainModule],
  providers: [StateRecordingService],
  exports: [StateRecordingService],
})
export class StateRecordingModule {}
