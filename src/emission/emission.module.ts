import { Module } from '@nestjs/common';
import { InvariantsModule } from '../invariants/invariants.module';
import { PotModule } from '../pot/pot.module';
import { EmissionService } from './emission.service';

@Module({
  imports: [PotModule, InvariantsModule],
  providers: [EmissionService],
  exports: [EmissionService],
})
export class EmissionModule {}
