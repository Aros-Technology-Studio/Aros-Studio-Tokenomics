import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  const port = Number(process.env.PORTAL_PORT ?? process.env.PORT ?? 3100);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`AST Institutional Portal edge listening on :${port}`);
}

bootstrap();
