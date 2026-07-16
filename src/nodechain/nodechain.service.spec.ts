import { MemoryLedgerStore } from './memory-ledger.store';
import { NodechainService } from './nodechain.service';

describe('NodechainService', () => {
  let service: NodechainService;

  beforeEach(() => {
    service = new NodechainService(new MemoryLedgerStore());
  });

  it('appends immutable chain with growing height', () => {
    const a = service.append({
      writerRole: 'internal_service',
      recordType: 'test',
      payload: { n: 1 },
      processId: 'AST-DEMO-20260716-x',
    });
    const b = service.append({
      writerRole: 'quorum_validator',
      recordType: 'test',
      payload: { n: 2 },
      processId: 'AST-DEMO-20260716-x',
    });
    expect(a.height).toBe(1);
    expect(b.height).toBe(2);
    expect(b.prevHash).toBe(a.contentHash);
    expect(service.getHeight()).toBe(2);
  });

  it('rejects unauthorized writer roles', () => {
    expect(() =>
      service.append({
        writerRole: 'random' as 'internal_service',
        recordType: 'x',
        payload: {},
      }),
    ).toThrow(/unauthorized|INVALID|NODECHAIN/i);
  });
});
