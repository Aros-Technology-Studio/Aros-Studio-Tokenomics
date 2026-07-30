import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createAstLogger, jsonLogsEnabled, logJson } from './common/json-log';

async function bootstrap(): Promise<void> {
  if (process.env.KILL_SWITCH === 'true') {
    if (jsonLogsEnabled()) {
      logJson('warn', 'KILL_SWITCH=true — restricted mode');
    } else {
      // eslint-disable-next-line no-console
      console.warn('KILL_SWITCH=true — starting in restricted mode (no HTTP write surface yet)');
    }
  }

  const app = await NestFactory.create(AppModule, { logger: createAstLogger() as never });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  if (jsonLogsEnabled()) {
    logJson('info', 'AST Nest core listening', { port });
  } else {
    // eslint-disable-next-line no-console
    console.log(`AST Nest core listening on :${port}`);
    // eslint-disable-next-line no-console
    console.log('NodeChain: GET /v1/core/nodechain/status | npm run journal:status');
  }
}

bootstrap().catch((err) => {
  if (jsonLogsEnabled()) {
    logJson('error', err instanceof Error ? err.message : String(err));
  } else {
    console.error(err);
  }
  process.exit(1);
});
