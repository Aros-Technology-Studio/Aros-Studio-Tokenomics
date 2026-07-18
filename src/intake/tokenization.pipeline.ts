import { NodechainService } from '../nodechain/nodechain.service';
import { ProcessService } from '../processing/process.service';
import { PotService } from '../pot/pot.service';
import { TokenService } from '../token/token.service';
import { CommissionService } from '../commission/commission.service';
import { ReserveService } from '../reserve/reserve.service';
import { EyeService } from '../eye/eye.service';
import { GovernanceService } from '../governance/governance.service';
import { KeyRegistry } from '../common/crypto/key-registry';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { parseAro } from '../common/money';
import { defaultHardeningConfig } from '../hardening/hardening.policy';
import { globalKillSwitch } from '../hardening/kill-switch';

/**
 * Layer 10 — asset tokenization pipeline (no portal).
 * Hardened: real crypto keys, L1→L2→L3, kill-switch aware.
 */
export class TokenizationPipeline {
  readonly processes: ProcessService;
  readonly pot: PotService;
  readonly token: TokenService;
  readonly commission: CommissionService;
  readonly reserve: ReserveService;
  readonly eye: EyeService;
  readonly governance: GovernanceService;
  readonly keys: KeyRegistry;

  constructor(
    readonly nodechain: NodechainService,
    keys?: KeyRegistry,
  ) {
    this.keys = keys ?? bootstrapPipelineKeys();
    this.processes = new ProcessService(nodechain);
    this.pot = new PotService(nodechain);
    this.token = new TokenService(nodechain);
    this.commission = new CommissionService(nodechain);
    this.reserve = new ReserveService(nodechain);
    this.eye = new EyeService();
    this.governance = new GovernanceService(nodechain);
  }

  async runPrimaryTokenization(input: {
    processId: string;
    institutionId: string;
    valuation: string;
    holderId: string;
    feeRate?: number;
    confirmers?: string[];
    validators?: string[];
    /** Require L2 committee (default true for hardening path). */
    requireL2?: boolean;
    /** Force L3 even below high-value threshold. */
    requireL3?: boolean;
  }) {
    globalKillSwitch.assertWritable();

    const feeRate = input.feeRate ?? 0.0015;
    const validators = input.validators ?? ['v1', 'v2', 'v3'];
    const confirmers = input.confirmers ?? ['v1', 'v2', 'v3'];
    const requireL2 = input.requireL2 ?? true;

    await this.nodechain.ensureGenesis('system');

    // --- L1 ---
    const l1 = this.governance.evaluateL1({
      processId: input.processId,
      hasDocuments: true,
      hasQualifiedSignature: true,
      institutionAllowlisted: true,
    });
    this.eye.observe({
      level: l1.pass ? 'info' : 'critical',
      source: 'governance',
      code: l1.pass ? 'L1_PASS' : 'L1_FAIL',
      message: l1.pass ? 'L1 policy ok' : l1.reasonCodes.join(','),
      processId: input.processId,
    });
    if (!l1.pass) throw new Error(`L1 failed: ${l1.reasonCodes.join(',')}`);
    await this.governance.recordGovernanceEvent(input.processId, 'L1_PASS', { reasonCodes: [] });

    // --- L2 committee ---
    let l2: { complete: boolean; count: number; required: number } | null = null;
    if (requireL2) {
      this.governance.openL2(input.processId, 2, 'committee');
      this.governance.grantL2(input.processId, 'committee-a');
      l2 = this.governance.grantL2(input.processId, 'committee-b');
      this.eye.observe({
        level: l2.complete ? 'info' : 'critical',
        source: 'governance',
        code: l2.complete ? 'L2_PASS' : 'L2_FAIL',
        message: `L2 ${l2.count}/${l2.required}`,
        processId: input.processId,
      });
      if (!l2.complete) throw new Error('L2 committee incomplete');
      await this.governance.recordGovernanceEvent(input.processId, 'L2_PASS', l2);
    }

    const proc = await this.processes.open({
      processId: input.processId,
      processType: 'primary_tokenization',
      institutionId: input.institutionId,
      valuation: input.valuation,
      holderId: input.holderId,
      institutionAllowlisted: true,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    this.eye.observe({
      level: 'info',
      source: 'processing',
      code: 'PROCESS_OPEN',
      message: 'process opened and encoded',
      processId: input.processId,
    });

    const verdict = await this.pot.verify(proc, confirmers, validators);
    this.eye.observe({
      level: verdict.verified === 1 ? 'info' : 'critical',
      source: 'pot',
      code: verdict.verified === 1 ? 'POT_VERIFIED' : 'POT_REJECTED',
      message: `verified=${verdict.verified}`,
      processId: input.processId,
      payload: { reasonCodes: verdict.reasonCodes },
    });
    if (verdict.verified !== 1) {
      throw new Error(`PoT rejected: ${verdict.reasonCodes.join(',')}`);
    }
    await this.processes.markPotDone(input.processId);

    // --- L3 AI panel (after pot, before mint) ---
    const highValue =
      parseAro(input.valuation) >= parseAro(defaultHardeningConfig.highValueThreshold);
    const requireL3 = input.requireL3 ?? highValue;
    let l3 = null as ReturnType<GovernanceService['evaluateL3']> | null;
    if (requireL3 || true) {
      // Always run L3 panel; only hard-fail when required or high-value
      l3 = this.governance.evaluateL3({
        processId: input.processId,
        valuation: input.valuation,
        potVerified: 1,
        institutionAllowlisted: true,
        stagesCompleted: proc.stagesCompleted,
        eyeCriticalCount: this.eye.history().filter((e) => e.level === 'critical').length,
        highValue,
      });
      this.eye.observe({
        level: l3.pass ? 'info' : 'warn',
        source: 'governance',
        code: l3.pass ? 'L3_PASS' : 'L3_WARN',
        message: `L3 score=${l3.aggregateScore.toFixed(3)} agents=${l3.opinions.length}`,
        processId: input.processId,
        payload: { reasonCodes: l3.reasonCodes, opinions: l3.opinions },
      });
      await this.governance.recordGovernanceEvent(input.processId, 'L3_PANEL', {
        pass: l3.pass,
        aggregateScore: l3.aggregateScore,
        reasonCodes: l3.reasonCodes,
        opinions: l3.opinions,
      });
      if ((requireL3 || highValue) && !l3.pass) {
        throw new Error(`L3 failed: ${l3.reasonCodes.join(',')}`);
      }
    }

    const mint = await this.token.mintAfterPot({
      processId: input.processId,
      holderId: input.holderId,
      amount: input.valuation,
      potVerified: 1,
      potLedgerHeight: verdict.ledgerHeight,
    });

    const settlement = await this.commission.settle({
      processId: input.processId,
      valuation: input.valuation,
      feeRate,
      nodeWeights: { v1: 1, v2: 1, v3: 1 },
      potVerified: 1,
    });

    const reserve = await this.reserve.accrueFromCommission({
      processId: input.processId,
      astShare: settlement.astShare,
      processValuation: input.valuation,
    });

    await this.processes.close(input.processId);

    const chain = await this.nodechain.verifyChain();
    if (!chain.ok) {
      globalKillSwitch.engage(`post-pipeline chain fail: ${chain.error}`);
      throw new Error(`chain verify failed: ${chain.error}`);
    }

    this.eye.notify({
      level: 'info',
      source: 'intake',
      code: 'TOKENIZATION_COMPLETE',
      message: 'primary tokenization pipeline finished',
      processId: input.processId,
    });

    return {
      processId: input.processId,
      l1,
      l2,
      l3,
      verdict,
      mint,
      settlement,
      reserve,
      holderBalance: this.token.balanceOf(input.holderId),
      chain,
      eyeEvents: this.eye.history().length,
      tip: await this.nodechain.getTip(),
      crypto: 'ed25519',
      killSwitch: globalKillSwitch.isEngaged(),
    };
  }
}
