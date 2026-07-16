import { buildProcessId, formatUtcYyyymmdd, isValidProcessId } from './process-id';

describe('process-id', () => {
  it('builds AST-{INST}-{YYYYMMDD}-UUIDv7', () => {
    const id = buildProcessId('demo');
    expect(id.startsWith(`AST-DEMO-${formatUtcYyyymmdd()}-`)).toBe(true);
    expect(isValidProcessId(id)).toBe(true);
  });

  it('rejects bad institution codes', () => {
    expect(() => buildProcessId('bad-code!')).toThrow('INVALID_INSTITUTION_CODE');
  });
});
