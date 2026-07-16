import { NodesService } from '../nodes/nodes.service';
import { NodeReputationService, SUSPEND_GRACE_MS } from './node-reputation.service';

describe('NodeReputationService', () => {
  let rep: NodeReputationService;
  let nodes: NodesService;

  beforeEach(() => {
    nodes = new NodesService();
    rep = new NodeReputationService(nodes);
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

  it('suspends without slashing and restores after grace', () => {
    const t0 = Date.now();
    rep.suspendWithGrace('n1', t0);
    expect(nodes.get('n1')?.status).toBe('suspended');
    expect(rep.maybeRestore('n1', t0 + 1000)).toBe(false);
    expect(rep.maybeRestore('n1', t0 + SUSPEND_GRACE_MS + 1)).toBe(true);
    expect(nodes.get('n1')?.status).toBe('active');
  });
});
