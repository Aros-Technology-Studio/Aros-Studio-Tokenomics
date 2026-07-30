import { jsonLogsEnabled, logJson } from './json-log';

describe('json-log (I4)', () => {
  const prev = process.env.AST_LOG_JSON;

  afterEach(() => {
    if (prev === undefined) delete process.env.AST_LOG_JSON;
    else process.env.AST_LOG_JSON = prev;
  });

  it('detects flag', () => {
    process.env.AST_LOG_JSON = '1';
    expect(jsonLogsEnabled()).toBe(true);
    process.env.AST_LOG_JSON = '0';
    expect(jsonLogsEnabled()).toBe(false);
  });

  it('prints one JSON object line', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    logJson('info', 'hello', { height: 1 });
    expect(spy).toHaveBeenCalled();
    const raw = String(spy.mock.calls[0][0]);
    const obj = JSON.parse(raw) as { msg: string; height: number; level: string };
    expect(obj.msg).toBe('hello');
    expect(obj.height).toBe(1);
    expect(obj.level).toBe('info');
    spy.mockRestore();
  });
});
