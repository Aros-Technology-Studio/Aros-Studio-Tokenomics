import { VelocityTrackerService } from './velocity-tracker.service';

describe('VelocityTrackerService', () => {
  it('computes volume/supply', () => {
    const v = new VelocityTrackerService();
    v.setVolume24h('50');
    v.setCirculatingSupply('100');
    expect(v.velocity()).toBeCloseTo(0.5, 10);
  });
});
