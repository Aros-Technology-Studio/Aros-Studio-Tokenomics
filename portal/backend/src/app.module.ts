import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { HealthModule } from './modules/health/health.module';
import { AssetsModule } from './modules/assets/assets.module';
import { TokenizationModule } from './modules/tokenization/tokenization.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    AuthModule,
    ProcessesModule,
    DocumentsModule,
    HealthModule,
    AssetsModule,
    TokenizationModule,
    PublicModule,
  ],
})
export class AppModule {}
