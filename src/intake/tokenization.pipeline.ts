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
import { OrchestratorService } from '../orchestrator/orchestrator.service';

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
  /** Optional; sole-entry orchestrator path generates one if omitted. */
  idempotencyKey?: string;
}

/**
 * Layer 10 — Asset tokenization processes.
 * Primary path delegates to OrchestratorService (sole economic entry).
 * Reval/transfer keep specialized flows.
 */
export class TokenizationPipeline {
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
  readonly orchestrator: OrchestratorService;

  constructor(
    readonly nodechain: NodechainService,
    keys?: KeyRegistry,
    mirror?: IndexMirror,
  ) {
    this.keys = keys ?? bootstrapPipelineKeys();
    this.mirror = mirror ?? new MemoryIndexMirror();
    this.orchestrator = new OrchestratorService(nodechain, this.keys, this.mirror);
    // Share services with orchestrator so state stays consistent
    this.processes = this.orchestrator.processes;
    this.pot = this.orchestrator.pot;
    this.token = this.orchestrator.token;
    this.aroscoin = this.orchestrator.aroscoin;
    this.emission = this.orchestrator.emission;
    this.commission = this.orchestrator.commission;
    this.reserve = this.orchestrator.reserve;
    this.allSeeingEye = this.orchestrator.allSeeingEye;
    this.governance = this.orchestrator.governance;
    this.assets = this.orchestrator.assets;
  }

  async runPrimaryTokenization(input: PrimaryTokenizationInput) {
    let documentPackageHash: string | undefined;
    let hasDocuments = input.hasDocuments ?? true;
    let hasQualifiedSignature = input.hasQualifiedSignature ?? true;
    if (input.documentPackage) {
      assertDocumentPackage(input.documentPackage);
      documentPackageHash = hashDocumentPackage(input.documentPackage);
      hasDocuments = true;
      hasQualifiedSignature = input.documentPackage.hasQualifiedSignature;
    }

    const r = await this.orchestrator.runPrimary({
      institutionId: input.institutionId,
      valuation: input.valuation,
      holderId: input.holderId,
      assetId: input.assetId,
      processId: input.processId,
      feeRate: input.feeRate,
      confirmers: input.confirmers,
      validators: input.validators,
      requireL2: input.requireL2,
      l2Approvers: input.l2Approvers,
      requireL3: input.requireL3,
      institutionAllowlisted: input.institutionAllowlisted,
      hasDocuments,
      hasQualifiedSignature,
      documentPackageHash,
      idempotencyKey:
        input.idempotencyKey ??
        `pipe-${input.processId ?? input.institutionId}-${input.holderId}-${input.valuation}`,
    });

    return {
      processId: r.processId,
      assetId: r.assetId,
      documentPackageHash,
      l1: r.l1,
      l2: r.l2,
      l3: r.l3,
      verdict: r.verdict,
      mint: r.mint,
      emission: r.emission,
      settlement: r.settlement,
      reserve: r.reserve,
      reserveIndex: r.reserveIndex,
      asset: r.asset,
      tokenSnapshot: r.aroscoin,
      holderBalance: r.holderBalance,
      chain: r.chain,
      allSeeingEyeEvents: this.allSeeingEye.history().length,
      tip: r.tip,
      crypto: 'ed25519' as const,
      killSwitch: globalKillSwitch.isEngaged(),
      steps: r.steps,
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

    const emission = await this.emission.emitFromDeltaValue({
      processId,
      previousValue,
      newValue: input.newValue,
      potLedgerHeight: verdict.ledgerHeight,
    });
    const reval = emission.reval!;
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
