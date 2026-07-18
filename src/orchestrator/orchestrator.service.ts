import { createHash } from 'crypto';
import { NodechainService } from '../nodechain/nodechain.service';
import { ProcessService } from '../processing/process.service';
import { PotService } from '../pot/pot.service';
import { TokenService } from '../token/token.service';
import { ArosCoinService } from '../aroscoin/aroscoin.service';
import { EmissionService } from '../emission/emission.service';
import { CommissionService } from '../commission/commission.service';
import { ReserveService } from '../reserve/reserve.service';
import { AllSeeingEyeService } from '../all-seeing-eye/all-seeing-eye.service';
import { GovernanceService } from '../governance/governance.service';
import { EncodingService } from '../tx-encoding/encoding.service';
import { KeyRegistry } from '../common/crypto/key-registry';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { parseAro } from '../common/money';
import { makeProcessId, isValidProcessId } from '../common/process-id';
import { defaultHardeningConfig } from '../hardening/hardening.policy';
import { globalKillSwitch } from '../hardening/kill-switch';
import { AssetRegistry } from '../intake/asset-registry';
import type { IndexMirror } from '../index-mirror/index-mirror';
import { MemoryIndexMirror } from '../index-mirror/index-mirror';
import { MemoryJournalStore } from '../nodechain/memory.store';
import { OrchestratorError, OrchestratorErrorCode } from './errors';
import type {
  OrchestratorPrimaryInput,
  OrchestratorStepId,
  OrchestratorStepLog,
} from './types';

/**
 * Sole economic entry (P2 Orchestrator).
 * Fixed happy path: Start → Docs → L1/L2 → process_open → PoT → Emission →
 * Settlement → Reserve → State → End.
 * NodeChain is business truth; compensation only before verified=1 (abort path).
 */
export class OrchestratorService {
  readonly processes: ProcessService;
  readonly pot: PotService;
  readonly token: TokenService;
  readonly aroscoin: ArosCoinService;
  readonly emission: EmissionService;
  readonly commission: CommissionService;
  readonly reserve: ReserveService;
  readonly allSeeingEye: AllSeeingEyeService;
  readonly governance: GovernanceService;
  readonly assets: AssetRegistry;
  readonly keys: KeyRegistry;
  readonly mirror: IndexMirror;

  private readonly idempotency = new Map<string, string>(); // key → processId
  private readonly activeByInstitution = new Map<string, number>();
  private readonly maxConcurrent: number;

  constructor(
    readonly nodechain: NodechainService,
    keys?: KeyRegistry,
    mirror?: IndexMirror,
    opts?: { maxConcurrentPerInstitution?: number },
  ) {
    this.keys = keys ?? bootstrapPipelineKeys();
    this.processes = new ProcessService(nodechain, new EncodingService());
    this.pot = new PotService(nodechain);
    this.token = new TokenService(nodechain);
    this.aroscoin = new ArosCoinService(nodechain, this.token);
    this.emission = new EmissionService(nodechain, this.aroscoin);
    this.commission = new CommissionService(nodechain);
    this.reserve = new ReserveService(nodechain);
    this.allSeeingEye = new AllSeeingEyeService();
    this.governance = new GovernanceService(nodechain);
    this.assets = new AssetRegistry(nodechain);
    this.mirror = mirror ?? new MemoryIndexMirror();
    this.maxConcurrent = opts?.maxConcurrentPerInstitution ?? 10;
  }

  /** In-memory sole-entry factory for tests / local. */
  static createInMemory(opts?: {
    keys?: KeyRegistry;
    maxConcurrentPerInstitution?: number;
  }): OrchestratorService {
    const keys = opts?.keys ?? bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      verifyEveryN: 5,
    });
    return new OrchestratorService(nc, keys, undefined, {
      maxConcurrentPerInstitution: opts?.maxConcurrentPerInstitution,
    });
  }

  /**
   * Sole entry: primary tokenization happy path.
   */
  async runPrimary(input: OrchestratorPrimaryInput) {
    const steps: OrchestratorStepLog[] = [];
    const log = (step: OrchestratorStepId, ok: boolean, detail?: string) => {
      steps.push({ step, atUtc: new Date().toISOString(), ok, detail });
    };

    if (globalKillSwitch.isEngaged()) {
      throw new OrchestratorError(OrchestratorErrorCode.KILL_SWITCH, 'kill-switch engaged');
    }
    globalKillSwitch.assertWritable();

    if (!input.idempotencyKey?.trim() || input.idempotencyKey.trim().length < 8) {
      throw new OrchestratorError(
        OrchestratorErrorCode.IDEMPOTENCY_REQUIRED,
        'idempotencyKey required (min 8 chars)',
      );
    }
    const idemKey = `${input.institutionId}::${input.idempotencyKey.trim()}`;
    const fingerprint = hashInput(input);
    const prior = this.idempotency.get(idemKey);
    if (prior) {
      // same key must not start a second process with different payload
      throw new OrchestratorError(
        OrchestratorErrorCode.IDEMPOTENCY_CONFLICT,
        `idempotencyKey already used for process ${prior}`,
      );
    }

    log('start', true, fingerprint.slice(0, 12));

    const processId = input.processId ?? makeProcessId(input.institutionId);
    if (!isValidProcessId(processId)) {
      throw new OrchestratorError(
        OrchestratorErrorCode.INVALID_PROCESS_ID,
        `invalid processId: ${processId}`,
      );
    }
    this.idempotency.set(idemKey, processId);

    const active = this.activeByInstitution.get(input.institutionId) ?? 0;
    if (active >= this.maxConcurrent) {
      throw new OrchestratorError(
        OrchestratorErrorCode.CONCURRENT_LIMIT,
        `max ${this.maxConcurrent} concurrent processes for institution`,
      );
    }
    this.activeByInstitution.set(input.institutionId, active + 1);

    try {
      parseAro(input.valuation);
      const assetId = input.assetId ?? `asset-${processId}`;
      const feeRate = input.feeRate ?? 0.0015;
      const validators = input.validators ?? ['v1', 'v2', 'v3'];
      const confirmers = input.confirmers ?? ['v1', 'v2', 'v3'];
      const requireL2 = input.requireL2 ?? true;
      const l2Approvers = input.l2Approvers ?? ['committee-a', 'committee-b'];
      const hasDocuments = input.hasDocuments ?? true;
      const hasQualifiedSignature = input.hasQualifiedSignature ?? true;
      const institutionAllowlisted = input.institutionAllowlisted ?? true;
      const documentPackageHash = input.documentPackageHash;

      log('docs', hasDocuments && hasQualifiedSignature, documentPackageHash);

      await this.nodechain.ensureGenesis('system');
      await this.journalStep(processId, 'start', { idempotencyKey: input.idempotencyKey });

      const l1 = this.governance.evaluateL1({
        processId,
        hasDocuments,
        hasQualifiedSignature,
        institutionAllowlisted,
      });
      this.allSeeingEye.observe({
        level: l1.pass ? 'info' : 'critical',
        source: 'orchestrator',
        code: l1.pass ? 'L1_PASS' : 'L1_FAIL',
        message: l1.pass ? 'L1 policy ok' : l1.reasonCodes.join(','),
        processId,
      });
      log('l1', l1.pass, l1.reasonCodes.join(','));
      if (!l1.pass) {
        throw new OrchestratorError(
          OrchestratorErrorCode.L1_FAILED,
          `L1 failed: ${l1.reasonCodes.join(',')}`,
        );
      }
      await this.governance.recordGovernanceEvent(processId, 'L1_PASS', { reasonCodes: [] });
      await this.journalStep(processId, 'l1', { pass: true });

      let l2: { complete: boolean; count: number; required: number } | null = null;
      if (requireL2) {
        this.governance.openL2(processId, l2Approvers.length, 'committee');
        for (const approver of l2Approvers) {
          l2 = this.governance.grantL2(processId, approver);
        }
        if (!l2!.complete) {
          throw new OrchestratorError(OrchestratorErrorCode.L2_FAILED, 'L2 incomplete');
        }
        await this.governance.recordGovernanceEvent(processId, 'L2_PASS', {
          ...l2!,
          approvers: l2Approvers,
        });
        log('l2', true, `count=${l2!.count}`);
        await this.journalStep(processId, 'l2', l2!);
      } else {
        log('l2', true, 'skipped');
      }

      const proc = await this.processes.open({
        processId,
        processType: 'primary_tokenization',
        institutionId: input.institutionId,
        valuation: input.valuation,
        holderId: input.holderId,
        institutionAllowlisted,
        hasDocuments,
        hasQualifiedSignature,
      });
      log('process_open', true, proc.payloadHash);
      await this.journalStep(processId, 'process_open', {
        payloadHash: proc.payloadHash,
      });

      await this.assets.journalRegister({
        assetId,
        institutionId: input.institutionId,
        processId,
        valuation: input.valuation,
        holderId: input.holderId,
        documentPackageHash,
      });

      const verdict = await this.pot.verify({
        process: proc,
        confirmers,
        validatorIds: validators,
        keys: this.keys,
      });
      this.allSeeingEye.observe({
        level: verdict.verified === 1 ? 'info' : 'critical',
        source: 'pot',
        code: verdict.verified === 1 ? 'POT_VERIFIED' : 'POT_REJECTED',
        message: `verified=${verdict.verified}`,
        processId,
        payload: { reasonCodes: verdict.reasonCodes, criteriaResult: verdict.criteriaResult },
      });
      log('pot', verdict.verified === 1, verdict.reasonCodes.join(','));
      if (verdict.verified !== 1) {
        await this.processes.abort(processId, `PoT rejected: ${verdict.reasonCodes.join(',')}`);
        throw new OrchestratorError(
          OrchestratorErrorCode.POT_FAILED,
          `PoT rejected: ${verdict.reasonCodes.join(',')}`,
        );
      }
      await this.processes.markPotDone(processId, { potLedgerHeight: verdict.ledgerHeight });
      await this.journalStep(processId, 'pot', {
        verified: 1,
        ledgerHeight: verdict.ledgerHeight,
      });

      // Explicit ok-to-emit gate (journal P1–P4)
      const okToEmit = await this.pot.okToEmit(processId);

      const highValue =
        parseAro(input.valuation) >= parseAro(defaultHardeningConfig.highValueThreshold);
      const requireL3HardFail = input.requireL3 ?? highValue;
      const l3 = await this.governance.evaluateL3({
        processId,
        valuation: input.valuation,
        potVerified: 1,
        institutionAllowlisted,
        stagesCompleted: this.processes.get(processId)?.stagesCompleted ?? proc.stagesCompleted,
        allSeeingEyeCriticalCount: this.allSeeingEye
          .history()
          .filter((e) => e.level === 'critical').length,
        highValue,
      });
      await this.governance.recordGovernanceEvent(processId, 'L3_PANEL', {
        pass: l3.pass,
        aggregateScore: l3.aggregateScore,
        reasonCodes: l3.reasonCodes,
      });
      log('l3', l3.pass || !requireL3HardFail, `score=${l3.aggregateScore}`);
      if (requireL3HardFail && !l3.pass) {
        await this.processes.abort(processId, `L3 failed: ${l3.reasonCodes.join(',')}`);
        throw new OrchestratorError(
          OrchestratorErrorCode.L3_FAILED,
          `L3 failed: ${l3.reasonCodes.join(',')}`,
        );
      }
      await this.journalStep(processId, 'l3', { pass: l3.pass });

      // Emission: valuation-based ArosCoin mint
      const emission = await this.emission.emitFromValuation({
        processId,
        holderId: input.holderId,
        valuation: input.valuation,
        potLedgerHeight: okToEmit.potLedgerHeight,
      });
      log('emission', true, emission.amount);
      await this.journalStep(processId, 'emission', {
        amount: emission.amount,
        mode: emission.mode,
      });

      // Post-factum commission 70/30
      const settlement = await this.commission.settleCommission({
        processId,
        valuation: input.valuation,
        feeRate,
        nodeWeights: Object.fromEntries(confirmers.map((c) => [c, 1])),
        potVerified: 1,
      });
      log('settlement', true, settlement.fee);
      await this.journalStep(processId, 'settlement', {
        fee: settlement.fee,
        nodesPool: settlement.nodesPool,
        astShare: settlement.astShare,
      });

      // Own-funds reserve + reserveIndex
      const reserve = await this.reserve.accrueFromCommission({
        processId,
        astShare: settlement.astShare,
        processValuation: input.valuation,
      });
      log('reserve', true, `index=${reserve.reserveIndex}`);
      await this.journalStep(processId, 'reserve', {
        ownBalance: reserve.ownBalance,
        reserveIndex: reserve.reserveIndex,
      });

      await this.processes.markSettled(processId, {
        note: 'emission+commission+reserve',
      });
      await this.processes.close(processId);
      log('state', true, 'closed');
      await this.journalStep(processId, 'state', { stage: 'closed' });

      await this.mirror.replayFrom(this.nodechain);
      const chain = await this.nodechain.verifyChain();
      if (!chain.ok) {
        globalKillSwitch.engage(`post-orchestrator chain fail: ${chain.error}`);
        throw new Error(`chain verify failed: ${chain.error}`);
      }

      log('end', true);
      await this.journalStep(processId, 'end', { chainOk: true });

      this.allSeeingEye.notify({
        level: 'info',
        source: 'orchestrator',
        code: 'PRIMARY_COMPLETE',
        message: 'sole-entry primary tokenization finished',
        processId,
      });

      return {
        processId,
        assetId,
        idempotencyKey: input.idempotencyKey.trim(),
        steps,
        l1,
        l2,
        l3,
        verdict,
        okToEmit,
        emission,
        mint: emission.mint!,
        settlement,
        reserve,
        reserveIndex: this.reserve.reserveIndex(),
        asset: this.assets.get(assetId),
        aroscoin: this.aroscoin.snapshot(),
        holderBalance: this.aroscoin.balanceOf(input.holderId),
        chain,
        tip: await this.nodechain.getTip(),
        crypto: 'ed25519' as const,
      };
    } finally {
      const n = this.activeByInstitution.get(input.institutionId) ?? 1;
      this.activeByInstitution.set(input.institutionId, Math.max(0, n - 1));
    }
  }

  private async journalStep(
    processId: string,
    step: OrchestratorStepId,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.nodechain.append({
      clientRecordId: `orch-step:${processId}:${step}`,
      recordType: 'orchestrator_step',
      processId,
      payload: { step, ...payload },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
  }
}

function hashInput(input: OrchestratorPrimaryInput): string {
  const material = JSON.stringify({
    institutionId: input.institutionId,
    valuation: input.valuation,
    holderId: input.holderId,
    assetId: input.assetId,
    processId: input.processId,
  });
  return createHash('sha256').update(material).digest('hex');
}
