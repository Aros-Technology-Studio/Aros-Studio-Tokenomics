import { EventEmitter2 } from '@nestjs/event-emitter';
import { NodesService } from '../nodes/nodes.service';
import {
  NODE_RESTORED_EVENT,
  NODE_SUSPENDED_EVENT,
  NodeReputationService,
  SUSPEND_GRACE_MS,
} from './node-reputation.service';

describe('NodeReputationService', () => {
  let rep: NodeReputationService;
  let nodes: NodesService;
  let events: EventEmitter2;

  beforeEach(() => {
    nodes = new NodesService();
    events = new EventEmitter2();
    rep = new NodeReputationService(nodes, events);
    nodes.register({
      nodeId: 'n1',
      institutionId: 'I1',
      certificateId: 'c',
      publicKey: 'pk',
      roles: ['confirmer'],
      approved: true,
      allowlisted: true,
    });
  });

  it('computes reputation from success rate and uptime', () => {
    rep.recordParticipation('n1', true);
    rep.recordParticipation('n1', true);
    rep.recordParticipation('n1', false);
    expect(rep.reputation('n1', 1)).toBeCloseTo(2 / 3, 5);
  });

  it('builds commission weights from reputation', () => {
    rep.recordParticipation('n1', true);
    const w = rep.weightsFor(['n1', 'n2'], { n1: 1, n2: 1 });
    expect(w.n1).toBe('1.000000000');
    expect(w.n2).toBe('0.000000000');
  });

  it('suspends without slashing and restores after grace', () => {
    const suspended: unknown[] = [];
    const restored: unknown[] = [];
    events.on(NODE_SUSPENDED_EVENT, (p) => suspended.push(p));
    events.on(NODE_RESTORED_EVENT, (p) => restored.push(p));

    const t0 = Date.now();
    rep.suspendWithGrace('n1', t0);
    expect(nodes.get('n1')?.status).toBe('suspended');
    expect(suspended).toHaveLength(1);
    expect(rep.maybeRestore('n1', t0 + 1000)).toBe(false);
    expect(rep.maybeRestore('n1', t0 + SUSPEND_GRACE_MS + 1)).toBe(true);
    expect(nodes.get('n1')?.status).toBe('active');
    expect(restored).toHaveLength(1);
  });
});
