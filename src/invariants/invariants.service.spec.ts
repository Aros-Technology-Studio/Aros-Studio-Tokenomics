import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from './invariants.service';
import { ALL_INVARIANT_IDS } from './invariant.registry';

describe('InvariantsService', () => {
  let service: InvariantsService;

  beforeEach(() => {
    service = new InvariantsService(new EventEmitter2());
  });

  it('registers all I1–I9', () => {
    expect(ALL_INVARIANT_IDS).toHaveLength(9);
  });

  it('fails I1 when emitting without potVerified=1', () => {
    expect(() =>
      service.assertInvariant('I1', {
        potVerified: 0,
        isNewEmission: true,
      }),
    ).toThrow(/I1/);
  });

  it('passes I1 when potVerified=1', () => {
    expect(() =>
      service.assertInvariant('I1', {
        potVerified: 1,
        isNewEmission: true,
      }),
    ).not.toThrow();
  });

  it('fails I6 when holding third-party funds', () => {
    expect(() =>
      service.assertInvariant('I6', { holdsThirdPartyFunds: true }),
    ).toThrow(/I6/);
  });

  it('fails I8 on external circulation before Release Phase', () => {
    expect(() =>
      service.assertInvariant('I8', {
        releasePhaseActive: false,
        externalCirculationAttempt: true,
      }),
    ).toThrow(/I8/);
  });

  it('fails I9 when new emission is not pro-rata', () => {
    expect(() =>
      service.assertInvariant('I9', {
        isNewEmission: true,
        newEmissionProRata: false,
      }),
    ).toThrow(/I9/);
  });

  it('checkAll returns one result per invariant', () => {
    const results = service.checkAll({});
    expect(results).toHaveLength(9);
    expect(results.every((r) => r.ok)).toBe(true);
  });
});
