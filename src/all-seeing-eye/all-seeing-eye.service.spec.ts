import { AllSeeingEyeService } from './all-seeing-eye.service';

describe('AllSeeingEyeService', () => {
  let eye: AllSeeingEyeService;

  beforeEach(() => {
    eye = new AllSeeingEyeService();
  });

  it('observes and alerts without executive powers', () => {
    eye.observe('process.started', { processId: 'p1' });
    eye.notify('critical', 'E_TEST', 'test');
    expect(eye.listObservations().length).toBeGreaterThanOrEqual(2);
    expect(eye.listAlerts()).toHaveLength(1);
  });

  it('cannot be disabled in prod', () => {
    expect(() => eye.setEnabled(false, 'prod')).toThrow(/prod/i);
  });

  it('can be disabled in test', () => {
    eye.setEnabled(false, 'test');
    eye.observe('x');
    expect(eye.listObservations()).toHaveLength(0);
  });
});
