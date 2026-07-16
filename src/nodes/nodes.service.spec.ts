import { NodesService } from './nodes.service';

describe('NodesService', () => {
  let nodes: NodesService;

  beforeEach(() => {
    nodes = new NodesService();
  });

  it('requires allowlist and approval', () => {
    expect(() =>
      nodes.register({
        nodeId: 'n1',
        institutionId: 'INST1',
        certificateId: 'cert1',
        publicKey: 'pk',
        roles: ['confirmer'],
        approved: false,
        allowlisted: true,
      }),
    ).toThrow(/allowlist|approval/i);
  });

  it('allows multi-node per institution and one voter id per institution', () => {
    nodes.register({
      nodeId: 'n1',
      institutionId: 'INST1',
      certificateId: 'c1',
      publicKey: 'pk1',
      roles: ['confirmer'],
      approved: true,
      allowlisted: true,
    });
    nodes.register({
      nodeId: 'n2',
      institutionId: 'INST1',
      certificateId: 'c1',
      publicKey: 'pk2',
      roles: ['confirmer', 'executor'],
      approved: true,
      allowlisted: true,
    });
    expect(nodes.listByInstitution('INST1')).toHaveLength(2);
    expect(nodes.institutionalVoterIds()).toEqual(['INST1']);
  });

  it('suspends on low uptime heartbeat', () => {
    nodes.register({
      nodeId: 'n1',
      institutionId: 'INST1',
      certificateId: 'c1',
      publicKey: 'pk',
      roles: ['confirmer'],
      approved: true,
      allowlisted: true,
    });
    const n = nodes.heartbeat('n1', 0.5);
    expect(n.status).toBe('suspended');
  });
});
