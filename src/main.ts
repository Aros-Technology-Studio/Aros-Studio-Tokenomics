import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  if (process.env.KILL_SWITCH === 'true') {
    // eslint-disable-next-line no-console
    console.warn('KILL_SWITCH=true — starting in restricted mode (no HTTP write surface yet)');
  }

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`AST Nest core listening on :${port}`);
  // eslint-disable-next-line no-console
  console.log('NodeChain: GET /v1/core/nodechain/status | npm run journal:status');
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
