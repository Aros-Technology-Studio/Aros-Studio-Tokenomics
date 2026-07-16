import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { NodesService } from '../nodes/nodes.service';
import { PotService, POT_TIMEOUT_MS } from './pot.service';
import { PotEvidence } from './pot.types';

function evidence(over: Partial<PotEvidence> = {}): PotEvidence {
  return {
    processId: 'AST-DEMO-20260716-0192f3c4-8b2a-7d6e-9f01-23456789abcd',
    executionSnapshot: { hash: 'h1', prevHash: 'h0' },
    assignedValidatorIds: ['v1', 'v2', 'v3'],
    validatorIds: ['v1', 'v2'],
    signatures: ['sig1', 'sig2'],
    criteriaResult: { P1: true, P2: true, P3: true, P4: true },
    ...over,
  };
}

function registerConfirmers(nodes: NodesService, ids: string[]): void {
  for (const id of ids) {
    nodes.register({
      nodeId: id,
      institutionId: `I-${id}`,
      certificateId: `c-${id}`,
      publicKey: `pk-${id}`,
      roles: ['confirmer'],
      approved: true,
      allowlisted: true,
    });
  }
}

describe('PotService', () => {
  let pot: PotService;
  let nodechain: NodechainService;
  let nodes: NodesService;

  beforeEach(() => {
    nodechain = new NodechainService(new MemoryLedgerStore());
    nodes = new NodesService();
    pot = new PotService(
      nodechain,
      new InvariantsService(new EventEmitter2()),
      nodes,
    );
  });

  it('verifies only with P1–P4 + quorum and write-ahead NodeChain', () => {
    const v = pot.confirm(evidence());
    expect(v.verified).toBe(1);
    expect(v.ledgerHeight).toBe(1);
    expect(pot.okToEmit(v.processId)).toBe(true);
    expect(nodechain.getByHeight(1)?.recordType).toBe('pot_verdict');
  });

  it('rejects when quorum not met', () => {
    const v = pot.confirm(
      evidence({
        validatorIds: ['v1'],
        signatures: ['sig1'],
      }),
    );
    expect(v.verified).toBe(0);
    expect(v.reasonCodes?.P2).toMatch(/QUORUM/i);
  });

  it('rejects when any Pi fails', () => {
    const v = pot.confirm(
      evidence({
        criteriaResult: { P1: true, P2: false, P3: true, P4: true },
      }),
    );
    expect(v.verified).toBe(0);
    expect(v.failedCriteria).toContain('P2');
  });

  it('rejects double confirmation', () => {
    pot.confirm(evidence());
    expect(() => pot.confirm(evidence())).toThrow(/double/i);
  });

  it('expires after timeout', () => {
    const pid = 'AST-DEMO-20260716-timeout-case-000000000002';
    const t0 = Date.now();
    pot.confirm(
      evidence({
        processId: pid,
        criteriaResult: { P1: false, P2: true, P3: true, P4: true },
      }),
      { now: t0 },
    );
    const late = pot.confirm(evidence({ processId: pid }), {
      now: t0 + POT_TIMEOUT_MS + 1,
    });
    expect(late.status).toBe('expired');
  });

  it('rejects suspended validator when registry active', () => {
    registerConfirmers(nodes, ['v1', 'v2', 'v3']);
    nodes.suspend('v1');
    const v = pot.confirm(evidence());
    expect(v.verified).toBe(0);
    expect(v.reasonCodes?.P1).toMatch(/NOT_ELIGIBLE/i);
  });

  it('accepts only active confirmers from registry', () => {
    registerConfirmers(nodes, ['v1', 'v2', 'v3']);
    const v = pot.confirm(evidence());
    expect(v.verified).toBe(1);
  });
});
