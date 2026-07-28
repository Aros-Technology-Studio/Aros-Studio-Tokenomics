import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NodechainPublicService } from './nodechain-public.service';
import type { CoreApiClient } from '../../common/core-client';

describe('NodechainPublicService', () => {
  it('returns 503 when core hand-off disabled', async () => {
    const core = {
      enabled: false,
      getNodechainStatus: () => {
        throw new Error('should not call');
      },
    } as unknown as CoreApiClient;
    const svc = new NodechainPublicService(core);
    const r = await svc.status();
    assert.equal(r.statusCode, 503);
    assert.equal(r.body.code, 'CORE_HANDOFF_DISABLED');
  });

  it('proxies status when core enabled', async () => {
    let called = false;
    const core = {
      enabled: true,
      getNodechainStatus: async () => {
        called = true;
        return {
          statusCode: 200,
          body: { hasGenesis: true, recordCount: 1 },
        };
      },
    } as unknown as CoreApiClient;
    const svc = new NodechainPublicService(core);
    const r = await svc.status();
    assert.equal(r.statusCode, 200);
    assert.equal(r.body.hasGenesis, true);
    assert.equal(called, true);
  });
});
