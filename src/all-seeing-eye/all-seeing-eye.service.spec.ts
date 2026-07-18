import { AllSeeingEyeService } from './all-seeing-eye.service';

describe('AllSeeingEyeService', () => {
  it('records observe events and forbids veto', () => {
    const allSeeingEye = new AllSeeingEyeService();
    allSeeingEye.observe({
      level: 'info',
      source: 'test',
      code: 'T1',
      message: 'hello',
    });
    expect(allSeeingEye.history()).toHaveLength(1);
    expect(() => allSeeingEye.veto()).toThrow(/no veto/i);
  });
});
