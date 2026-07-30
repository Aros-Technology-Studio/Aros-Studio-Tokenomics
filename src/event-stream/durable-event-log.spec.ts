import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DurableEventLog } from './durable-event-log';
import { EventStreamService } from './event-stream.service';
import { AllSeeingEyeService } from '../all-seeing-eye/all-seeing-eye.service';
import { createNodechain } from '../nodechain/journal.factory';

describe('DurableEventLog (B4)', () => {
  it('memory append and resume by seq', async () => {
    const log = DurableEventLog.memory();
    await log.append({ type: 'eye.notification', code: 'A', message: 'one' });
    await log.append({ type: 'record_appended', height: 1, recordId: 'r1' });
    const page = await log.query({ fromSeq: 1, limit: 10 });
    expect(page.events).toHaveLength(1);
    expect(page.events[0].type).toBe('record_appended');
    expect(page.nextSeq).toBe(2);
    expect(page.tipSeq).toBe(2);
  });

  it('file durability across reopen', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-ev-'));
    const file = path.join(dir, 'observer-events.jsonl');
    try {
      const a = await DurableEventLog.open(file);
      await a.append({ type: 'tip_advanced', height: 0, tipHash: 'hh' });
      const b = await DurableEventLog.open(file);
      expect(b.tipSeq()).toBe(1);
      const q = await b.query({ fromSeq: 0 });
      expect(q.events[0].type).toBe('tip_advanced');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('filters by type and fromHeight', async () => {
    const log = DurableEventLog.memory();
    await log.append({ type: 'record_appended', height: 0 });
    await log.append({ type: 'eye.notification', message: 'x', code: 'C' });
    await log.append({ type: 'record_appended', height: 2 });
    const q = await log.query({
      fromSeq: 0,
      fromHeight: 2,
      types: ['record_appended'],
    });
    expect(q.events).toHaveLength(1);
    expect(q.events[0].height).toBe(2);
  });

  it('Eye observeDurable writes stream; NodeChain append publishes', async () => {
    const stream = EventStreamService.memory();
    const eye = new AllSeeingEyeService(stream);
    await eye.observeDurable({
      level: 'warn',
      source: 'test',
      code: 'W1',
      message: 'watch',
    });

    const { nodechain } = createNodechain({ engine: 'memory' });
    nodechain.setOnRecordAppended(async (r) => {
      await stream.onRecordAppended(r);
    });
    await nodechain.ensureGenesis('system');

    const page = await stream.query({ fromSeq: 0, limit: 50 });
    const types = page.events.map((e) => e.type);
    expect(types).toContain('eye.notification');
    expect(types).toContain('record_appended');
    expect(types).toContain('tip_advanced');
  });
});
