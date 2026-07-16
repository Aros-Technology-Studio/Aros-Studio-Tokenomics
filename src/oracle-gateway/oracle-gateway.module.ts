import { Module } from '@nestjs/common';
import { NodechainModule } from '../nodechain/nodechain.module';
import { OracleGatewayService } from './oracle-gateway.service';

@Module({
  imports: [NodechainModule],
  providers: [OracleGatewayService],
  exports: [OracleGatewayService],
})
export class OracleGatewayModule {}
