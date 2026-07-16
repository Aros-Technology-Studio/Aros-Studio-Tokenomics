import { Module } from '@nestjs/common';
import { AroscoinModule } from '../aroscoin/aroscoin.module';
import { NodechainModule } from '../nodechain/nodechain.module';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';
import { PotModule } from '../pot/pot.module';
import { ReleaseModule } from '../release/release.module';
import { ReserveModule } from '../reserve/reserve.module';
import { PartialReleaseService } from './partial-release.service';

@Module({
  imports: [
    OrchestratorModule,
    PotModule,
    AroscoinModule,
    ReserveModule,
    ReleaseModule,
    NodechainModule,
  ],
  providers: [PartialReleaseService],
  exports: [PartialReleaseService],
})
export class PartialReleaseModule {}
