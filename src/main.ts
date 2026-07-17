/**
 * Nest entry placeholder. Primary journal path for v0.1 is CLI:
 *   npm run journal:first
 */
import 'reflect-metadata';

async function bootstrap(): Promise<void> {
  // HTTP API later; journal is usable via NodechainService + CLI.
  // eslint-disable-next-line no-console
  console.log('AST core — use: npm run journal:first');
}

void bootstrap();
