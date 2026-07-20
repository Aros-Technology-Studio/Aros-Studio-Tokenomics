import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { ProcessesModule } from '../processes/processes.module';

@Module({
  imports: [ProcessesModule],
  controllers: [DocumentsController],
})
export class DocumentsModule {}

