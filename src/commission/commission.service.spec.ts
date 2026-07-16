import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { PotService } from '../pot/pot.service';
import { ReserveService } from '../reserve/reserve.service';
import { CommissionService } from './commission.service';

const PID = 'AST-DEMO-20260716-0192f3c4-8b2a-7d6e-9f01-23456789abcd';

describe('CommissionService', () => {
  let commission: CommissionService;
  let pot: PotService;

  beforeEach(() => {
    const nodechain = new NodechainService(new MemoryLedgerStore());
    const invariants = new InvariantsService(new EventEmitter2());
    pot = new PotService(nodechain, invariants);
    const reserve = new ReserveService(invariants);
    commission = new CommissionService(pot, nodechain, reserve);
    pot.confirm({
      processId: PID,
      executionSnapshot: { hash: 'h', prevHash: 'p' },
      validatorIds: ['v1'],
      signatures: ['s'],
      criteriaResult: { P1: true, P2: true, P3: true, P4: true },
    });
  });

  it('settles on pot with 70/30 split', () => {
    const r = commission.settleCommission({
      processId: PID,
      valuation: '1000',
      feeRate: '0.0015',
      nodeWeights: { n1: '1', n2: '1' },
    });
    // fee = 1.5, node 1.05, reserve 0.45
    expect(r.feeAro).toBe('1.500000000');
    expect(r.nodePool).toBe('1.050000000');
    expect(r.astReserve).toBe('0.450000000');
    expect(Object.keys(r.payments)).toHaveLength(2);
  });
});
