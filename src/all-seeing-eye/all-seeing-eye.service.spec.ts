import { AllSeeingEyeService } from './all-seeing-eye.service';
import { EventStreamService } from '../event-stream/event-stream.service';

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

  it('observeDurable assigns stream seq', async () => {
    const stream = EventStreamService.memory();
    const eye = new AllSeeingEyeService(stream);
    const n = await eye.observeDurable({
      level: 'critical',
      source: 'test',
      code: 'C1',
      message: 'alert',
    });
    expect(n.seq).toBe(1);
    const page = await stream.query({ fromSeq: 0 });
    expect(page.events[0].type).toBe('eye.notification');
  });
});
