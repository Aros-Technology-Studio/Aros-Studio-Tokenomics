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
import { AssetRegistry } from './asset-registry';
import { makeProcessId, isValidProcessId } from './process-id';
import {
  assertDocumentPackage,
  hashDocumentPackage,
  type DocumentPackage,
} from './document-package';
import type { IndexMirror } from '../index-mirror/index-mirror';
import { MemoryIndexMirror } from '../index-mirror/index-mirror';

export interface PrimaryTokenizationInput {
  institutionId: string;
  valuation: string;
  holderId: string;
  assetId?: string;
  processId?: string;
  documentPackage?: DocumentPackage;
  feeRate?: number;
  confirmers?: string[];
  validators?: string[];
  requireL2?: boolean;
  l2Approvers?: string[];
  requireL3?: boolean;
  institutionAllowlisted?: boolean;
  hasDocuments?: boolean;
  hasQualifiedSignature?: boolean;
}

/**
 * Layer 10 — Asset tokenization processes (no portal).
 * Orchestrates layers 01–09 for primary mint, revaluation, ownership transfer.
 */
export class TokenizationPipeline {
  readonly processes: ProcessService;
  readonly pot: PotService;
  readonly token: TokenService;
  readonly commission: CommissionService;
  readonly reserve: ReserveService;
  readonly eye: EyeService;
  readonly governance: GovernanceService;
  readonly assets: AssetRegistry;
  readonly keys: KeyRegistry;
  readonly mirror: IndexMirror;

  constructor(
    readonly nodechain: NodechainService,
    keys?: KeyRegistry,
    mirror?: IndexMirror,
  ) {
    this.keys = keys ?? bootstrapPipelineKeys();
    this.processes = new ProcessService(nodechain);
    this.pot = new PotService(nodechain);
    this.token = new TokenService(nodechain);
    this.commission = new CommissionService(nodechain);
    this.reserve = new ReserveService(nodechain);
    this.eye = new EyeService();
    this.governance = new GovernanceService(nodechain);
    this.assets = new AssetRegistry(nodechain);
    this.mirror = mirror ?? new MemoryIndexMirror();
  }

  async runPrimaryTokenization(input: PrimaryTokenizationInput) {
    globalKillSwitch.assertWritable();

    const processId = input.processId ?? makeProcessId(input.institutionId);
    if (!isValidProcessId(processId)) {
      throw new Error(`invalid processId: ${processId}`);
    }
    const assetId = input.assetId ?? `asset-${processId}`;
    const feeRate = input.feeRate ?? 0.0015;
    const validators = input.validators ?? ['v1', 'v2', 'v3'];
    const confirmers = input.confirmers ?? ['v1', 'v2', 'v3'];
    const requireL2 = input.requireL2 ?? true;
    const l2Approvers = input.l2Approvers ?? ['committee-a', 'committee-b'];

    let hasDocuments = input.hasDocuments ?? true;
    let hasQualifiedSignature = input.hasQualifiedSignature ?? true;
    let documentPackageHash: string | undefined;
    if (input.documentPackage) {
      assertDocumentPackage(input.documentPackage);
      documentPackageHash = hashDocumentPackage(input.documentPackage);
      hasDocuments = true;
      hasQualifiedSignature = input.documentPackage.hasQualifiedSignature;
    }
    const institutionAllowlisted = input.institutionAllowlisted ?? true;

    parseAro(input.valuation); // validate amount

    await this.nodechain.ensureGenesis('system');

    const l1 = this.governance.evaluateL1({
      processId,
      hasDocuments,
      hasQualifiedSignature,
      institutionAllowlisted,
    });
    this.eye.observe({
      level: l1.pass ? 'info' : 'critical',
      source: 'governance',
      code: l1.pass ? 'L1_PASS' : 'L1_FAIL',
      message: l1.pass ? 'L1 policy ok' : l1.reasonCodes.join(','),
      processId,
    });
    if (!l1.pass) throw new Error(`L1 failed: ${l1.reasonCodes.join(',')}`);
    await this.governance.recordGovernanceEvent(processId, 'L1_PASS', { reasonCodes: [] });

    let l2: { complete: boolean; count: number; required: number } | null = null;
    if (requireL2) {
      if (!l2Approvers.length) throw new Error('L2 requires l2Approvers');
      this.governance.openL2(processId, l2Approvers.length, 'committee');
      for (const approver of l2Approvers) {
        l2 = this.governance.grantL2(processId, approver);
      }
      if (!l2!.complete) throw new Error('L2 committee incomplete');
      await this.governance.recordGovernanceEvent(processId, 'L2_PASS', {
        ...l2!,
        approvers: l2Approvers,
      });
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

    await this.assets.journalRegister({
      assetId,
      institutionId: input.institutionId,
      processId,
      valuation: input.valuation,
      holderId: input.holderId,
      documentPackageHash,
    });

    this.eye.observe({
      level: 'info',
      source: 'processing',
      code: 'PROCESS_OPEN',
      message: 'process opened and asset registered',
      processId,
      payload: { assetId, documentPackageHash },
    });

    const verdict = await this.pot.verify({
      process: proc,
      confirmers,
      validatorIds: validators,
      keys: this.keys,
    });
    this.eye.observe({
      level: verdict.verified === 1 ? 'info' : 'critical',
      source: 'pot',
      code: verdict.verified === 1 ? 'POT_VERIFIED' : 'POT_REJECTED',
      message: `verified=${verdict.verified}`,
      processId,
      payload: {
        reasonCodes: verdict.reasonCodes,
        criteriaResult: verdict.criteriaResult,
        attestationDigest: verdict.attestationDigest,
      },
    });
    if (verdict.verified !== 1) {
      await this.processes.abort(processId, `PoT rejected: ${verdict.reasonCodes.join(',')}`);
      throw new Error(`PoT rejected: ${verdict.reasonCodes.join(',')}`);
    }
    await this.processes.markPotDone(processId, { potLedgerHeight: verdict.ledgerHeight });

    const highValue =
      parseAro(input.valuation) >= parseAro(defaultHardeningConfig.highValueThreshold);
    const requireL3HardFail = input.requireL3 ?? highValue;
    const l3 = await this.governance.evaluateL3({
      processId,
      valuation: input.valuation,
      potVerified: 1,
      institutionAllowlisted,
      stagesCompleted: this.processes.get(processId)?.stagesCompleted ?? proc.stagesCompleted,
      eyeCriticalCount: this.eye.history().filter((e) => e.level === 'critical').length,
      highValue,
    });
    await this.governance.recordGovernanceEvent(processId, 'L3_PANEL', {
      pass: l3.pass,
      aggregateScore: l3.aggregateScore,
      reasonCodes: l3.reasonCodes,
      opinions: l3.opinions,
    });
    if (requireL3HardFail && !l3.pass) {
      await this.processes.abort(processId, `L3 failed: ${l3.reasonCodes.join(',')}`);
      throw new Error(`L3 failed: ${l3.reasonCodes.join(',')}`);
    }

    const mint = await this.token.mintAfterPot({
      processId,
      holderId: input.holderId,
      amount: input.valuation,
      potVerified: 1,
      potLedgerHeight: verdict.ledgerHeight,
    });

    const settlement = await this.commission.settle({
      processId,
      valuation: input.valuation,
      feeRate,
      nodeWeights: Object.fromEntries(confirmers.map((c) => [c, 1])),
      potVerified: 1,
    });

    const reserve = await this.reserve.accrueFromCommission({
      processId,
      astShare: settlement.astShare,
      processValuation: input.valuation,
    });

    await this.processes.markSettled(processId, { note: 'mint+commission+reserve' });
    await this.processes.close(processId);
    await this.mirror.replayFrom(this.nodechain);

    const chain = await this.nodechain.verifyChain();
    if (!chain.ok) {
      globalKillSwitch.engage(`post-pipeline chain fail: ${chain.error}`);
      throw new Error(`chain verify failed: ${chain.error}`);
    }

    this.eye.notify({
      level: 'info',
      source: 'intake',
      code: 'TOKENIZATION_COMPLETE',
      message: 'primary tokenization finished',
      processId,
    });

    return {
      processId,
      assetId,
      documentPackageHash,
      l1,
      l2,
      l3,
      verdict,
      mint,
      settlement,
      reserve,
      asset: this.assets.get(assetId),
      tokenSnapshot: this.token.snapshot(),
      holderBalance: this.token.balanceOf(input.holderId),
      chain,
      eyeEvents: this.eye.history().length,
      tip: await this.nodechain.getTip(),
      crypto: 'ed25519' as const,
      killSwitch: globalKillSwitch.isEngaged(),
    };
  }

  /**
   * Revaluation process: new institutional value → pro-rata supply change.
   */
  async runRevaluation(input: {
    assetId: string;
    newValue: string;
    processId?: string;
    documentPackage?: DocumentPackage;
    confirmers?: string[];
    validators?: string[];
    l2Approvers?: string[];
    requireL2?: boolean;
  }) {
    globalKillSwitch.assertWritable();
    const asset = this.assets.get(input.assetId);
    if (!asset) throw new Error(`unknown asset ${input.assetId}`);

    const processId = input.processId ?? makeProcessId(asset.institutionId);
    const previousValue = asset.currentValue;
    parseAro(input.newValue);

    let hasDocuments = true;
    let hasQualifiedSignature = true;
    if (input.documentPackage) {
      assertDocumentPackage(input.documentPackage);
      hasQualifiedSignature = input.documentPackage.hasQualifiedSignature;
    }

    const l1 = this.governance.evaluateL1({
      processId,
      hasDocuments,
      hasQualifiedSignature,
      institutionAllowlisted: true,
    });
    if (!l1.pass) throw new Error(`L1 failed: ${l1.reasonCodes.join(',')}`);

    if (input.requireL2 !== false) {
      const approvers = input.l2Approvers ?? ['committee-a', 'committee-b'];
      this.governance.openL2(processId, approvers.length);
      for (const a of approvers) this.governance.grantL2(processId, a);
    }

    const proc = await this.processes.open({
      processId,
      processType: 'revaluation',
      institutionId: asset.institutionId,
      body: {
        institutionId: asset.institutionId,
        assetId: input.assetId,
        previousValue: previousValue,
        newValue: input.newValue,
      },
      valuation: input.newValue,
      holderId: asset.holderIds[0] ?? 'unknown',
      institutionAllowlisted: true,
      hasDocuments,
      hasQualifiedSignature,
    });

    const confirmers = input.confirmers ?? ['v1', 'v2', 'v3'];
    const validators = input.validators ?? ['v1', 'v2', 'v3'];
    const verdict = await this.pot.verify({
      process: proc,
      confirmers,
      validatorIds: validators,
      keys: this.keys,
    });
    if (verdict.verified !== 1) {
      await this.processes.abort(processId, `PoT rejected: ${verdict.reasonCodes.join(',')}`);
      throw new Error(`PoT rejected: ${verdict.reasonCodes.join(',')}`);
    }
    await this.processes.markPotDone(processId, { potLedgerHeight: verdict.ledgerHeight });

    const reval = await this.token.revalueAfterPot({
      processId,
      previousValue,
      newValue: input.newValue,
      potVerified: 1,
      potLedgerHeight: verdict.ledgerHeight,
    });
    this.assets.applyRevaluation(input.assetId, input.newValue);
    await this.processes.markSettled(processId, { note: 'revaluation' });
    await this.processes.close(processId);
    await this.mirror.replayFrom(this.nodechain);

    return {
      processId,
      assetId: input.assetId,
      verdict,
      reval,
      asset: this.assets.get(input.assetId),
      tokenSnapshot: this.token.snapshot(),
      chain: await this.nodechain.verifyChain(),
    };
  }

  /**
   * Ownership transfer of tokenized rights between holders.
   */
  async runOwnershipTransfer(input: {
    assetId: string;
    fromHolderId: string;
    toHolderId: string;
    amount: string;
    processId?: string;
    documentPackage?: DocumentPackage;
    confirmers?: string[];
    validators?: string[];
    l2Approvers?: string[];
  }) {
    globalKillSwitch.assertWritable();
    const asset = this.assets.get(input.assetId);
    if (!asset) throw new Error(`unknown asset ${input.assetId}`);

    const processId = input.processId ?? makeProcessId(asset.institutionId);
    parseAro(input.amount);

    let hasDocuments = true;
    let hasQualifiedSignature = true;
    if (input.documentPackage) {
      assertDocumentPackage(input.documentPackage);
      hasQualifiedSignature = input.documentPackage.hasQualifiedSignature;
    }

    const l1 = this.governance.evaluateL1({
      processId,
      hasDocuments,
      hasQualifiedSignature,
      institutionAllowlisted: true,
    });
    if (!l1.pass) throw new Error(`L1 failed: ${l1.reasonCodes.join(',')}`);

    const approvers = input.l2Approvers ?? ['committee-a', 'committee-b'];
    this.governance.openL2(processId, approvers.length);
    for (const a of approvers) this.governance.grantL2(processId, a);

    const proc = await this.processes.open({
      processId,
      processType: 'ownership_transfer',
      institutionId: asset.institutionId,
      body: {
        institutionId: asset.institutionId,
        assetId: input.assetId,
        fromHolderId: input.fromHolderId,
        toHolderId: input.toHolderId,
        amount: input.amount,
      },
      valuation: input.amount,
      holderId: input.toHolderId,
      institutionAllowlisted: true,
      hasDocuments,
      hasQualifiedSignature,
    });

    const confirmers = input.confirmers ?? ['v1', 'v2', 'v3'];
    const validators = input.validators ?? ['v1', 'v2', 'v3'];
    const verdict = await this.pot.verify({
      process: proc,
      confirmers,
      validatorIds: validators,
      keys: this.keys,
    });
    if (verdict.verified !== 1) {
      await this.processes.abort(processId, `PoT rejected: ${verdict.reasonCodes.join(',')}`);
      throw new Error(`PoT rejected: ${verdict.reasonCodes.join(',')}`);
    }
    await this.processes.markPotDone(processId, { potLedgerHeight: verdict.ledgerHeight });

    const transfer = await this.token.transferAfterPot({
      processId,
      fromHolderId: input.fromHolderId,
      toHolderId: input.toHolderId,
      amount: input.amount,
      potVerified: 1,
      potLedgerHeight: verdict.ledgerHeight,
    });
    this.assets.applyTransfer(input.assetId, input.fromHolderId, input.toHolderId);
    await this.processes.markSettled(processId, { note: 'ownership_transfer' });
    await this.processes.close(processId);
    await this.mirror.replayFrom(this.nodechain);

    return {
      processId,
      assetId: input.assetId,
      verdict,
      transfer,
      asset: this.assets.get(input.assetId),
      tokenSnapshot: this.token.snapshot(),
      chain: await this.nodechain.verifyChain(),
    };
  }
}
