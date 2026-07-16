import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvariantsService } from '../invariants/invariants.service';
import { ReserveService } from './reserve.service';

describe('ReserveService', () => {
  let reserve: ReserveService;

  beforeEach(() => {
    reserve = new ReserveService(new InvariantsService(new EventEmitter2()));
  });

  it('hard-fails lock when insufficient', () => {
    reserve.credit('AST_OWN', 'GEL', '10');
    expect(() => reserve.lock('AST_OWN', 'GEL', '11')).toThrow(/insufficient/i);
  });

  it('computes reserveIndex = log10(1+volume)', () => {
    reserve.recordConfirmedVolume('99');
    // log10(100) = 2
    expect(reserve.reserveIndex()).toBeCloseTo(2, 10);
  });

  it('records child on partial release', () => {
    reserve.credit('AST_OWN', 'GEL', '100');
    reserve.lock('AST_OWN', 'GEL', '50');
    reserve.partialReleaseChild({
      bagId: 'AST_OWN',
      assetKey: 'GEL',
      amount: '10',
      processId: 'AST-DEMO-20260716-x',
    });
    expect(reserve.getChildren()).toHaveLength(1);
  });
});
