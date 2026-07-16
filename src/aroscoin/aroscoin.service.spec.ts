import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { PotService } from '../pot/pot.service';
import { AroscoinService } from './aroscoin.service';

const PID = 'AST-DEMO-20260716-0192f3c4-8b2a-7d6e-9f01-23456789abcd';

describe('AroscoinService', () => {
  let coin: AroscoinService;
  let pot: PotService;

  beforeEach(() => {
    const nodechain = new NodechainService(new MemoryLedgerStore());
    const invariants = new InvariantsService(new EventEmitter2());
    pot = new PotService(nodechain, invariants);
    coin = new AroscoinService(pot, nodechain, invariants);
    pot.confirm({
      processId: PID,
      executionSnapshot: { hash: 'h', prevHash: 'p' },
      validatorIds: ['v1'],
      signatures: ['s'],
      criteriaResult: { P1: true, P2: true, P3: true, P4: true },
    });
  });

  it('mints only after pot and records nodechain', () => {
    const r = coin.mint({
      processId: PID,
      claimId: 'c1',
      amountAro: '10.5',
      holderId: 'inst-1',
    });
    expect(r.amountAro).toBe('10.500000000');
    expect(r.ledgerHeight).toBeGreaterThan(0);
    expect(coin.balanceOf('inst-1')).toBe('10.500000000');
  });

  it('forbids privileged mint paths', () => {
    expect(() => coin.refusePrivilegedMint()).toThrow(/forbidden/i);
  });

  it('rejects double mint same process+claim', () => {
    coin.mint({ processId: PID, claimId: 'c1', amountAro: '1', holderId: 'h' });
    expect(() =>
      coin.mint({ processId: PID, claimId: 'c1', amountAro: '1', holderId: 'h' }),
    ).toThrow(/double/i);
  });
});
