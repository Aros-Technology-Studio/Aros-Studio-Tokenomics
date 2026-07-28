import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { EdgeProcessStore } from './edge-process-store';
import type { ProcessRecord } from '../../common/edge-shared';

describe('EdgeProcessStore', () => {
  let dir: string;
  let file: string;

  before(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ast-edge-'));
    file = path.join(dir, 'edge-processes.json');
  });

  after(() => {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  });

  it('round-trips processes and idempotency', () => {
    const store = new EdgeProcessStore(file);
    const rec: ProcessRecord = {
      processId: 'AST-DEMO-20260723-persist1',
      institutionId: 'DEMO',
      processType: 'primary_tokenization',
      status: 'awaiting_core',
      valuation: '10.000000000',
      holderId: 'h1',
      hasQualifiedSignature: true,
      documentPackageHash: 'ab'.repeat(32),
      idempotencyKey: 'idem-persist-test-01',
      payloadFingerprint: 'fp1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.save({
      version: 1,
      processes: [rec],
      idempotency: [
        {
          scope: 'DEMO::idem-persist-test-01',
          processId: rec.processId,
          fingerprint: 'fp1',
        },
      ],
    });
    const loaded = store.load();
    assert.equal(loaded.processes.length, 1);
    assert.equal(loaded.processes[0].processId, rec.processId);
    assert.equal(loaded.idempotency[0].scope, 'DEMO::idem-persist-test-01');
  });
});
