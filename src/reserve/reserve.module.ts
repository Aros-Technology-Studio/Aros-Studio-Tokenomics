import { Module } from '@nestjs/common';
import { InvariantsModule } from '../invariants/invariants.module';
import { ReserveService } from './reserve.service';

@Module({
  imports: [InvariantsModule],
  providers: [ReserveService],
  exports: [ReserveService],
})
export class ReserveModule {}
