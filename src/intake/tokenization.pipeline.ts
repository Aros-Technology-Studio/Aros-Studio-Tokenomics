import { NodechainService } from '../nodechain/nodechain.service';
import { ProcessService } from '../processing/process.service';
import { PotService } from '../pot/pot.service';
import { TokenService } from '../token/token.service';
import { CommissionService } from '../commission/commission.service';
import { ReserveService } from '../reserve/reserve.service';
import { EyeService } from '../eye/eye.service';
import { GovernanceService } from '../governance/governance.service';

/**
 * Layer 10 — asset tokenization pipeline (no portal).
 * Orchestrates layers 02–09 against NodeChain.
 */
export class TokenizationPipeline {
  readonly processes: ProcessService;
  readonly pot: PotService;
  readonly token: TokenService;
  readonly commission: CommissionService;
  readonly reserve: ReserveService;
  readonly eye: EyeService;
  readonly governance: GovernanceService;

  constructor(readonly nodechain: NodechainService) {
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
  }) {
    const feeRate = input.feeRate ?? 0.0015;
    const validators = input.validators ?? ['v1', 'v2', 'v3'];
    const confirmers = input.confirmers ?? ['v1', 'v2', 'v3'];

    await this.nodechain.ensureGenesis();

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
    if (!l1.pass) {
      throw new Error(`L1 failed: ${l1.reasonCodes.join(',')}`);
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
    this.eye.notify({
      level: 'info',
      source: 'intake',
      code: 'TOKENIZATION_COMPLETE',
      message: 'primary tokenization pipeline finished',
      processId: input.processId,
    });

    return {
      processId: input.processId,
      verdict,
      mint,
      settlement,
      reserve,
      holderBalance: this.token.balanceOf(input.holderId),
      chain,
      eyeEvents: this.eye.history().length,
      tip: await this.nodechain.getTip(),
    };
  }
}
