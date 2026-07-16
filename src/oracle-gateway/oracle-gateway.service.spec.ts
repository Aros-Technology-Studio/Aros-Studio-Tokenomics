import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import {
  OracleGatewayService,
  stubOracleSignature,
} from './oracle-gateway.service';

describe('OracleGatewayService', () => {
  let gw: OracleGatewayService;

  beforeEach(() => {
    gw = new OracleGatewayService(new NodechainService(new MemoryLedgerStore()));
    gw.setRequiredCount(2);
  });

  it('accepts multi-oracle stub signatures', () => {
    const payload = { transport: 'x' };
    const r = gw.submit('AST-DEMO-20260716-p1', [
      {
        oracleId: 'o1',
        payload,
        signature: stubOracleSignature(payload, 'o1'),
        publicKey: 'stub',
      },
      {
        oracleId: 'o2',
        payload,
        signature: stubOracleSignature(payload, 'o2'),
        publicKey: 'stub',
      },
    ]);
    expect(r.ok).toBe(true);
    expect(r.acceptedCount).toBe(2);
  });

  it('fails closed when quorum not met', () => {
    const payload = { transport: 'x' };
    const r = gw.submit('AST-DEMO-20260716-p2', [
      {
        oracleId: 'o1',
        payload,
        signature: stubOracleSignature(payload, 'o1'),
        publicKey: 'stub',
      },
    ]);
    expect(r.ok).toBe(false);
    expect(r.reasonCode).toBe('ORACLE_QUORUM_FAILED');
  });
});
