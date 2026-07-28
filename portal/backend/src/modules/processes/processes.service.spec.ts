import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ProcessesService } from './processes.service';
import { CoreApiClient } from '../../common/core-client';
import { EdgeProcessStore } from './edge-process-store';

const hash = 'b'.repeat(64);
const goodBody = {
  processType: 'primary_tokenization' as const,
  valuation: '250000.50',
  holderId: 'holder-1',
  hasQualifiedSignature: true,
  documentPackageHash: hash,
};

class StubCore extends CoreApiClient {
  constructor(private readonly mode: 'ok' | 'down' | 'off') {
    super({ baseUrl: 'http://core.test' });
  }
  override get enabled() {
    return this.mode !== 'off';
  }
  override async createProcess() {
    if (this.mode === 'down') {
      return { statusCode: 503, body: { code: 'CORE_UNAVAILABLE', message: 'down' } };
    }
    return {
      statusCode: 202,
      body: {
        processId: 'AST-DEMO-20260719-fromcore',
        status: 'completed',
        mint: { amount: '250000.500000000' },
        verdict: { verified: 1 },
      },
    };
  }
  override async getProcess(processId: string) {
    if (this.mode === 'down') {
      return { statusCode: 503, body: { code: 'CORE_UNAVAILABLE' } };
    }
    return {
      statusCode: 200,
      body: { processId, status: 'settled', potVerified: 1, source: 'core' },
    };
  }
}

function freshService(mode: 'ok' | 'down' | 'off') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-edge-svc-'));
  const store = new EdgeProcessStore(path.join(dir, 'edge.json'));
  return new ProcessesService(new StubCore(mode), store);
}

describe('ProcessesService (institutional portal edge)', () => {
  it('rejects without valuation / signature', async () => {
    const svc = freshService('off');
    const r = await svc.create(
      { ...goodBody, hasQualifiedSignature: false },
      'DEMO',
      'idem-00000002',
    );
    assert.equal(r.statusCode, 422);
    assert.equal((r.body as { code: string }).code, 'MISSING_QUALIFIED_SIGNATURE');
  });

  it('hands off to core when available', async () => {
    const svc = freshService('ok');
    const r = await svc.create(goodBody, 'DEMO', 'idem-core-ok-0001', 'demo-token');
    assert.equal(r.statusCode, 202);
    // Core stub returns completed + mint → UI status promotes to completed
    assert.ok(
      r.body.status === 'submitted_to_core' || r.body.status === 'completed',
    );
    assert.ok(r.body.progress);
    assert.ok((r.body.progress as { handedOff?: boolean }).handedOff);
  });

  it('lists processes for institution', async () => {
    const svc = freshService('off');
    await svc.create(goodBody, 'DEMO', 'idem-list-0001');
    await svc.create({ ...goodBody, holderId: 'h2' }, 'DEMO', 'idem-list-0002');
    const list = svc.listForInstitution('DEMO');
    assert.equal(list.length, 2);
    assert.equal(svc.listForInstitution('ACME').length, 0);
  });

  it('stats and status filter', async () => {
    const svc = freshService('off');
    await svc.create(goodBody, 'DEMO', 'idem-stats-0001');
    const st = svc.statsForInstitution('DEMO');
    assert.equal(st.total, 1);
    assert.ok(st.awaitingCore >= 1);
    assert.equal(svc.listForInstitution('DEMO', { status: 'awaiting_core' }).length, 1);
    assert.equal(svc.listForInstitution('DEMO', { status: 'submitted_to_core' }).length, 0);
  });

  it('keeps awaiting_core when core down (no edge mint)', async () => {
    const svc = freshService('down');
    const r = await svc.create(goodBody, 'DEMO', 'idem-core-down-01');
    assert.equal(r.statusCode, 202);
    assert.equal(r.body.status, 'awaiting_core');
    assert.ok(r.body.coreError);
  });

  it('persists edge processes across service instances', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-edge-pers-'));
    const file = path.join(dir, 'edge.json');
    const store1 = new EdgeProcessStore(file);
    const svc1 = new ProcessesService(new StubCore('off'), store1);
    await svc1.create(goodBody, 'DEMO', 'idem-persist-aa01');
    const svc2 = new ProcessesService(new StubCore('off'), new EdgeProcessStore(file));
    assert.equal(svc2.listForInstitution('DEMO').length, 1);
  });

  it('retry hand-off moves awaiting_core to submitted when core ok', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-edge-retry-'));
    const file = path.join(dir, 'edge.json');
    const store = new EdgeProcessStore(file);
    const svcDown = new ProcessesService(new StubCore('down'), store);
    const created = await svcDown.create(goodBody, 'DEMO', 'idem-retry-hh01');
    assert.equal(created.body.status, 'awaiting_core');
    const processId = String(created.body.processId);
    const svcOk = new ProcessesService(new StubCore('ok'), new EdgeProcessStore(file));
    const r = await svcOk.retryHandoff(processId, 'DEMO', 'tok');
    assert.ok(
      r.body.status === 'submitted_to_core' || r.body.status === 'completed',
    );
    assert.ok((r.body.progress as { handedOff?: boolean }).handedOff);
  });
});
