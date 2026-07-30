/**
 * I4 — structured JSON logs to stdout (Loki/ELK/shipper friendly).
 * Enable: AST_LOG_JSON=1
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function jsonLogsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.AST_LOG_JSON === '1' || env.AST_LOG_JSON === 'true';
}

export function logJson(
  level: LogLevel,
  message: string,
  fields?: Record<string, unknown>,
): void {
  const line = {
    ts: new Date().toISOString(),
    level,
    service: process.env.AST_SERVICE_NAME ?? 'ast-core',
    msg: message,
    ...(fields ?? {}),
  };
  const s = JSON.stringify(line);
  if (level === 'error') console.error(s);
  else if (level === 'warn') console.warn(s);
  else console.log(s);
}

/** Nest-compatible logger using JSON lines when enabled. */
export function createAstLogger() {
  if (!jsonLogsEnabled()) {
    return ['error', 'warn', 'log'] as ('error' | 'warn' | 'log')[];
  }
  return {
    log: (message: unknown) => logJson('info', String(message)),
    error: (message: unknown, trace?: string) =>
      logJson('error', String(message), trace ? { trace } : undefined),
    warn: (message: unknown) => logJson('warn', String(message)),
    debug: (message: unknown) => logJson('debug', String(message)),
    verbose: (message: unknown) => logJson('debug', String(message)),
  };
}
