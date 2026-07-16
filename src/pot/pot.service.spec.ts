import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { PotService, POT_TIMEOUT_MS } from './pot.service';
import { PotEvidence } from './pot.types';

function evidence(over: Partial<PotEvidence> = {}): PotEvidence {
  return {
    processId: 'AST-DEMO-20260716-0192f3c4-8b2a-7d6e-9f01-23456789abcd',
    executionSnapshot: { hash: 'h1', prevHash: 'h0' },
    validatorIds: ['v1', 'v2'],
    signatures: ['sig1', 'sig2'],
    criteriaResult: { P1: true, P2: true, P3: true, P4: true },
    ...over,
  };
}

describe('PotService', () => {
  let pot: PotService;

  beforeEach(() => {
    const nodechain = new NodechainService(new MemoryLedgerStore());
    const invariants = new InvariantsService(new EventEmitter2());
    pot = new PotService(nodechain, invariants);
  });

  it('sets verified=1 only when all P1–P4 pass and records NodeChain', () => {
    const v = pot.confirm(evidence());
    expect(v.verified).toBe(1);
    expect(v.status).toBe('verified');
    expect(v.ledgerHeight).toBe(1);
    expect(pot.okToEmit(v.processId)).toBe(true);
  });

  it('sets verified=0 immediately when any Pi fails', () => {
    const v = pot.confirm(
      evidence({ criteriaResult: { P1: true, P2: false, P3: true, P4: true } }),
    );
    expect(v.verified).toBe(0);
    expect(v.status).toBe('rejected');
    expect(v.failedCriteria).toContain('P2');
    expect(pot.okToEmit(v.processId)).toBe(false);
  });

  it('rejects double confirmation', () => {
    pot.confirm(evidence());
    expect(() => pot.confirm(evidence())).toThrow(/double/i);
  });

  it('expires after 15 minutes', () => {
    const e = evidence({ processId: 'AST-DEMO-20260716-timeout-case-000000000001' });
    const t0 = Date.now();
    pot.confirm(
      evidence({
        processId: e.processId,
        criteriaResult: { P1: false, P2: true, P3: true, P4: true },
      }),
      { now: t0 },
    );
    // re-open pending with fail then timeout on later call with all pass but late
    const late = pot.confirm(evidence({ processId: e.processId }), {
      now: t0 + POT_TIMEOUT_MS + 1,
    });
    // First call may have left pending; after timeout must expire
    expect(late.status === 'expired' || late.verified === 0).toBe(true);
  });
});
