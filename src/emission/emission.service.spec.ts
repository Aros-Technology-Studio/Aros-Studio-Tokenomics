import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { PotService } from '../pot/pot.service';
import { EmissionService } from './emission.service';

describe('EmissionService', () => {
  let emission: EmissionService;
  let pot: PotService;

  beforeEach(() => {
    const nodechain = new NodechainService(new MemoryLedgerStore());
    const invariants = new InvariantsService(new EventEmitter2());
    pot = new PotService(nodechain, invariants);
    emission = new EmissionService(pot, invariants);

    pot.confirm({
      processId: 'AST-DEMO-20260716-0192f3c4-8b2a-7d6e-9f01-23456789abcd',
      executionSnapshot: { hash: 'h', prevHash: 'p' },
      assignedValidatorIds: ['v1', 'v2', 'v3'],
      validatorIds: ['v1', 'v2'],
      signatures: ['s1', 's2'],
      criteriaResult: { P1: true, P2: true, P3: true, P4: true },
    });
  });

  it('refuses emission without pot', () => {
    expect(() =>
      emission.plan({
        processId: 'AST-DEMO-20260716-no-pot-000000000000000001',
        institutionalValuation: '100',
        deltaValue: '1',
      }),
    ).toThrow(/pot/i);
  });

  it('plans mint from institutional valuation on positive delta', () => {
    const plan = emission.plan({
      processId: 'AST-DEMO-20260716-0192f3c4-8b2a-7d6e-9f01-23456789abcd',
      institutionalValuation: '1000.1234567899',
      deltaValue: '1000',
    });
    expect(plan.mintAro).toBe('1000.123456789');
    expect(plan.burnAro).toBe('0.000000000');
  });

  it('emit zero when delta is 0', () => {
    const plan = emission.plan({
      processId: 'AST-DEMO-20260716-0192f3c4-8b2a-7d6e-9f01-23456789abcd',
      institutionalValuation: '1000',
      deltaValue: '0',
    });
    expect(plan.mintAro).toBe('0.000000000');
  });
});
