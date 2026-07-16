import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { ReleaseService } from '../release/release.service';
import { ReserveService } from '../reserve/reserve.service';
import { VelocityTrackerService } from '../velocity-tracker/velocity-tracker.service';
import { ReleaseDaemonService } from './release-daemon.service';

describe('ReleaseDaemonService', () => {
  it('initiates when metrics met and governance ok', () => {
    const invariants = new InvariantsService(new EventEmitter2());
    const reserve = new ReserveService(invariants);
    const velocity = new VelocityTrackerService();
    const release = new ReleaseService(
      new NodechainService(new MemoryLedgerStore()),
      invariants,
    );
    const daemon = new ReleaseDaemonService(reserve, velocity, release);

    reserve.recordConfirmedVolume('99'); // index ~2
    velocity.setVolume24h('50');
    velocity.setCirculatingSupply('100'); // velocity 0.5
    daemon.configure(1, 0.1);
    release.setGovernanceApproval(true);

    const r = daemon.tick();
    expect(r.met).toBe(true);
    expect(r.activated).toBe(true);
    expect(release.getState()).toBe('active');
  });
});
