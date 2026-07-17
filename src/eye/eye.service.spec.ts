import { EyeService } from './eye.service';

describe('EyeService', () => {
  it('observes and never vetoes', () => {
    const eye = new EyeService();
    eye.observe({
      level: 'info',
      source: 'test',
      code: 'X',
      message: 'hi',
    });
    expect(eye.history()).toHaveLength(1);
    expect(() => eye.veto()).toThrow(/no veto/i);
  });
});
