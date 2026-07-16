import { Module } from '@nestjs/common';
import { AllSeeingEyeService } from './all-seeing-eye.service';

@Module({
  providers: [AllSeeingEyeService],
  exports: [AllSeeingEyeService],
})
export class AllSeeingEyeModule {}
