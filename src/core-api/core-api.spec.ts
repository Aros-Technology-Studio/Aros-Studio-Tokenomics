import { CoreProcessesController } from './processes.controller';
import { CorePartialReleaseController } from './partial-release.controller';
import { CoreNodechainController } from './nodechain.controller';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { createNodechain } from '../nodechain/journal.factory';
import { globalKillSwitch } from '../hardening/kill-switch';

describe('Core API NodeChain controller', () => {
  afterEach(() => {
    globalKillSwitch.release();
  });

  it('status / tip / verify / by-height after genesis', async () => {
    const { nodechain } = createNodechain({ engine: 'memory' });
    const ctrl = new CoreNodechainController(nodechain);

    const g = await ctrl.genesis();
    expect(g.height).toBe(0);
    expect(g.ok).toBe(true);

    const status = await ctrl.status();
    expect(status.hasGenesis).toBe(true);
    expect(status.service).toBe('nodechain');
    expect(status.chain.ok).toBe(true);

    const tip = await ctrl.tip();
    expect(tip.tip?.height).toBe(0);

    const verify = await ctrl.verify();
    expect(verify.ok).toBe(true);
    expect(verify.height).toBe(0);

    const byH = await ctrl.byHeight('0');
    expect(byH.record.recordType).toBe('genesis');

    const byId = await ctrl.byRecordId(g.recordId);
    expect(byId.record.height).toBe(0);

    await expect(ctrl.byHeight('99')).rejects.toMatchObject({ status: 404 });
  });

  it('lists process-scoped records', async () => {
    const { nodechain } = createNodechain({ engine: 'memory' });
    const ctrl = new CoreNodechainController(nodechain);
    await nodechain.ensureGenesis('system');
    await nodechain.append({
      clientRecordId: 'nc-ctrl-proc-1',
      recordType: 'process_open',
      processId: 'AST-DEMO-20260720-nctest1',
      payload: { stage: 'open' },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
    const list = await ctrl.byProcess('AST-DEMO-20260720-nctest1');
    expect(list.count).toBe(1);
    expect(list.records[0].recordType).toBe('process_open');
  });

  it('institution cannot read foreign process history (B3)', async () => {
    const prev = process.env.AST_ALLOW_DEMO;
    process.env.AST_ALLOW_DEMO = '1';
    const { nodechain } = createNodechain({ engine: 'memory' });
    const ctrl = new CoreNodechainController(nodechain);
    await nodechain.ensureGenesis('system');
    await nodechain.append({
      clientRecordId: 'nc-ctrl-proc-bank',
      recordType: 'process_open',
      processId: 'AST-BANK-20260720-nctest1',
      payload: { stage: 'open', secret: 'nope' },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
    await expect(
      ctrl.byProcess(
        'AST-BANK-20260720-nctest1',
        undefined,
        'DEMO',
        'demo-institution-token',
      ),
    ).rejects.toMatchObject({ status: 404 });

    const own = await ctrl.byProcess(
      'AST-DEMO-20260720-nctest1',
      undefined,
      'DEMO',
      'demo-institution-token',
    );
    // process never opened for DEMO — empty list ok (not 404 if process pattern owned)
    expect(own.processId).toBe('AST-DEMO-20260720-nctest1');
    expect(own.count).toBe(0);
    expect(own.scope).toBe('institution');
    process.env.AST_ALLOW_DEMO = prev;
  });

  it('returns NodeChain nodes list tip-first', async () => {
    const { nodechain } = createNodechain({ engine: 'memory' });
    const ctrl = new CoreNodechainController(nodechain);
    await nodechain.ensureGenesis('system');
    await nodechain.append({
      clientRecordId: 'nc-nodes-boot',
      recordType: 'system_boot',
      payload: { event: 'boot' },
      writerId: 'system',
      writerRole: 'system',
    });
    const feed = await ctrl.listNodes('10');
    expect(feed.count).toBe(2);
    expect(feed.nodes[0].height).toBe(1);
    expect(feed.nodes[0].type).toBe('system_boot');
    expect(feed.nodes[0].prevHash).toBe(feed.nodes[1].envelopeHash);
    expect(feed.nodes[1].height).toBe(0);
    expect(feed.nodes[1].type).toBe('genesis');
  });
});

describe('Core API processes controller', () => {
  afterEach(() => {
    globalKillSwitch.release();
  });

  it('runs orchestrator on POST /v1/core/processes', async () => {
    const orch = OrchestratorService.createInMemory();
    const ctrl = new CoreProcessesController(orch);

    const body = await ctrl.create(
      {
        valuation: '100.000000000',
        holderId: 'h1',
        hasQualifiedSignature: true,
        documentPackageHash: 'ab'.repeat(32),
        processId: 'AST-DEMO-20260719-coreapi1',
        assetId: 'asset-core-1',
      },
      'idem-core-api-test-001',
      'DEMO',
      undefined,
    );

    expect(body.processId).toBe('AST-DEMO-20260719-coreapi1');
    expect(body.status).toBe('completed');
    expect(body.verdict.verified).toBe(1);
    expect(body.mint.amount).toBe('100.000000000');
    expect(body.reserveIndex).toBeGreaterThanOrEqual(0);

    const status = await ctrl.get('AST-DEMO-20260719-coreapi1', 'DEMO');
    expect(status.potVerified).toBe(1);
    expect(status.mintAmount).toBe('100.000000000');
  });

  it('POST /v1/core/partial-release burns and remints', async () => {
    const orch = OrchestratorService.createInMemory();
    const processes = new CoreProcessesController(orch);
    await processes.create(
      {
        valuation: '100.000000000',
        holderId: 'h1',
        hasQualifiedSignature: true,
        processId: 'AST-DEMO-20260719-coremint',
      },
      'idem-core-mint-for-pr',
      'DEMO',
      undefined,
    );
    // Fund reserve for child claim
    await orch.reserve.accrueFromCommission({
      processId: 'AST-DEMO-20260719-corersv',
      astShare: '40.000000000',
      processValuation: '1000.000000000',
    });

    const pr = new CorePartialReleaseController(orch);
    const body = await pr.partialRelease(
      {
        holderId: 'h1',
        releaseAmount: '25.000000000',
        processId: 'AST-DEMO-20260719-corepr1',
        holderApproved: true,
        institutionApproved: true,
      },
      'idem-core-partial-001',
      'DEMO',
    );
    expect(body.status).toBe('completed');
    expect(body.releaseAmount).toBe('25.000000000');
    expect(body.balanceAfter).toBe('75.000000000');
  });
});
