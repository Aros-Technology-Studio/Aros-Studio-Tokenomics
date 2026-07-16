import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { ReleaseService } from './release.service';

describe('ReleaseService', () => {
  let release: ReleaseService;

  beforeEach(() => {
    release = new ReleaseService(
      new NodechainService(new MemoryLedgerStore()),
      new InvariantsService(new EventEmitter2()),
    );
  });

  it('blocks external actions before phase', () => {
    expect(() => release.assertExternalActionAllowed('cex_listing')).toThrow(
      /blocked|Release Phase|I8/i,
    );
  });

  it('activates only with thresholds + governance', () => {
    expect(() =>
      release.activateFromDaemon({
        reserveIndex: 2,
        velocity: 1,
        threshold: 1,
        target: 0.5,
      }),
    ).toThrow(/governance/i);

    release.setGovernanceApproval(true);
    expect(
      release.activateFromDaemon({
        reserveIndex: 2,
        velocity: 1,
        threshold: 1,
        target: 0.5,
      }),
    ).toBe('active');

    expect(() => release.assertExternalActionAllowed('bridge')).not.toThrow();
  });
});
