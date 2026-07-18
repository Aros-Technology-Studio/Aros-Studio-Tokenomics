import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { NodeRegistryService } from './node-registry.service';
import { NodeReputationService } from './node-reputation.service';

describe('Nodes (registry + reputation)', () => {
  it('registers, suspends with grace, and restores', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const reg = new NodeRegistryService(nc, { graceMs: 1000 });

    const n = await reg.register({ nodeId: 'v1', role: 'confirmer' });
    expect(n.status).toBe('active');
    expect(reg.isActive('v1')).toBe(true);

    const s = await reg.suspend('v1', 'low uptime');
    expect(s.status).toBe('suspended');
    expect(s.graceUntilUtc).toBeTruthy();
    expect(reg.isActive('v1')).toBe(false);

    await reg.restore('v1');
    expect(reg.isActive('v1')).toBe(true);

    const all = await nc.listAll();
    expect(all.some((r) => r.recordType === 'node_register')).toBe(true);
    expect(all.some((r) => r.recordType === 'node_suspend')).toBe(true);
  });

  it('computes reputation per Canon §9.8', () => {
    const rep = new NodeReputationService();
    rep.recordParticipation('v1', true);
    rep.recordParticipation('v1', true);
    rep.recordParticipation('v1', false);
    rep.setUptimeFactor('v1', 0.95);
    // (2/3) * 0.95
    expect(rep.reputation('v1')).toBeCloseTo((2 / 3) * 0.95, 5);
    expect(rep.weight('v1')).toBeGreaterThan(0);
  });

  it('filters eligible confirmers by active role', async () => {
    const reg = new NodeRegistryService();
    reg.registerMany(['v1', 'v2'], 'confirmer');
    await reg.register({ nodeId: 'obs1', role: 'observer' });
    await reg.suspend('v2', 'test');
    expect(reg.resolveEligibleConfirmers(['v1', 'v2', 'obs1', 'v3'])).toEqual(['v1']);
  });
});
