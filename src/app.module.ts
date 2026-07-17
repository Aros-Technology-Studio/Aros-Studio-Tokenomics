import { Module } from '@nestjs/common';
import { NodechainModule } from './nodechain/nodechain.module';

@Module({
  imports: [NodechainModule],
})
export class AppModule {}
