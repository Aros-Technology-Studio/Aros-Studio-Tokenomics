import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

/**
 * AST bootstrap. This is scaffolding only: the canon layers and the
 * service code migrate here by the phases in PROJECT_STATUS.md.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();
