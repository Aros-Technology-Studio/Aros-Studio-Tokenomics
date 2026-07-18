import { NodechainService } from '../nodechain/nodechain.service';
import { ProcessService } from '../processing/process.service';
import { PotService } from '../pot/pot.service';
import { ArosCoinService } from '../aroscoin/aroscoin.service';
import { ReserveService } from '../reserve/reserve.service';
import { KeyRegistry } from '../common/crypto/key-registry';
import { parseAro, formatAro, ARO_DUST, cmpAro } from '../common/money';
import { makeProcessId, isValidProcessId } from '../common/process-id';
import { resolveOkToEmit } from '../invariants';
import { assertInternalCirculation } from '../release/release-gate';
import type { ReleaseDaemon } from '../release/release-daemon';
import { PartialReleaseError, PartialReleaseErrorCode } from './errors';
import type { OracleGatewayService } from '../oracle-gateway/oracle-gateway.service';
import type { OraclePackage } from '../oracle-gateway/types';

export interface PartialReleaseInput {
  institutionId: string;
  holderId: string;
  /** Amount of ARO to release (burn + reserve child). */
  releaseAmount: string;
  /**
   * Amount to remint to holder after burn (defaults to balance - releaseAmount).
   * Must leave no dust below Canon dust unless zero.
   */
  remintAmount?: string;
  processId?: string;
  parentProcessId?: string;
  parentClaimId?: string;
  assetId?: string;
  idempotencyKey: string;
  /** Holder approval required (P0–P4). */
  holderApproved: boolean;
  /** Institutional approval required. */
  institutionApproved: boolean;
  confirmers?: string[];
  validators?: string[];
  /** Optional multi-oracle package (fail-closed if provided and invalid). */
  oracle?: OraclePackage;
  hasDocuments?: boolean;
  hasQualifiedSignature?: boolean;
}

export interface PartialReleaseResult {
  processId: string;
  holderId: string;
  releaseAmount: string;
  remintAmount: string;
  burn: { amount: string; recordId: string; ledgerHeight: number };
  reserveChild: {
    claimId: string;
    amount: string;
    parentClaimId: string;
    recordId: string;
  };
  remint: { amount: string; recordId: string; ledgerHeight: number } | null;
  potLedgerHeight: number;
  balanceAfter: string;
}

/**
 * Partial asset/position release — full new processId.
 * Atomic: burn → reserve child claim → remint remainder (internal pre-phase).
 */
export class PartialReleaseService {
  constructor(
    private readonly nodechain: NodechainService,
    private readonly processes: ProcessService,
    private readonly pot: PotService,
    private readonly aroscoin: ArosCoinService,
    private readonly reserve: ReserveService,
    private readonly keys: KeyRegistry,
    private readonly release?: ReleaseDaemon,
    private readonly oracle?: OracleGatewayService,
  ) {}

  async run(input: PartialReleaseInput): Promise<PartialReleaseResult> {
    if (!input.holderApproved || !input.institutionApproved) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.APPROVAL_REQUIRED,
        'holder and institution approval required',
      );
    }
    if (!input.idempotencyKey?.trim() || input.idempotencyKey.trim().length < 8) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.INVALID_PROCESS,
        'idempotencyKey required',
      );
    }

    // I8: external free-market release blocked until Release Phase
    if (this.release) {
      assertInternalCirculation(this.release, 'holder', 'internal_transfer');
    }

    let releaseArx: bigint;
    try {
      releaseArx = parseAro(input.releaseAmount);
    } catch {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.INVALID_AMOUNT,
        'invalid releaseAmount',
      );
    }
    if (releaseArx <= 0n) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.INVALID_AMOUNT,
        'releaseAmount must be positive',
      );
    }
    if (cmpAro(input.releaseAmount, ARO_DUST) < 0) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.DUST,
        `releaseAmount below dust ${ARO_DUST}`,
      );
    }

    const balanceBefore = this.aroscoin.balanceOf(input.holderId);
    const balArx = parseAro(balanceBefore);
    if (balArx < releaseArx) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.INSUFFICIENT_BALANCE,
        `holder balance ${balanceBefore} < release ${input.releaseAmount}`,
      );
    }

    // Atomic model: burn full balance → reserve child(release) → remint(remainder)
    const remintDefault = formatAro(balArx - releaseArx);
    const remintAmount = input.remintAmount ?? remintDefault;
    const remintArx = parseAro(remintAmount);
    if (remintArx < 0n) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.INVALID_AMOUNT,
        'remintAmount must be non-negative',
      );
    }
    if (remintArx > 0n && cmpAro(remintAmount, ARO_DUST) < 0) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.DUST,
        `remintAmount below dust ${ARO_DUST}`,
      );
    }
    if (remintArx + releaseArx !== balArx && input.remintAmount === undefined) {
      // default path always balances
    } else if (input.remintAmount !== undefined && remintArx + releaseArx > balArx) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.INVALID_AMOUNT,
        'releaseAmount + remintAmount exceeds balance',
      );
    }

    const processId = input.processId ?? makeProcessId(input.institutionId);
    if (!isValidProcessId(processId)) {
      throw new PartialReleaseError(
        PartialReleaseErrorCode.INVALID_PROCESS,
        `invalid processId ${processId}`,
      );
    }

    await this.nodechain.ensureGenesis('system');

    // Optional oracle step (fail-closed)
    if (input.oracle) {
      if (!this.oracle) {
        throw new PartialReleaseError(
          PartialReleaseErrorCode.POT_REQUIRED,
          'oracle package provided but gateway not configured',
        );
      }
      const oraclePkg = {
        ...input.oracle,
        processId: input.oracle.processId || processId,
      };
      if (oraclePkg.processId !== processId) {
        throw new PartialReleaseError(
          PartialReleaseErrorCode.INVALID_PROCESS,
          'oracle processId mismatch',
        );
      }
      const ov = this.oracle.require(oraclePkg);
      await this.oracle.journalReport(processId, ov);
    }

    const confirmers = input.confirmers ?? ['v1', 'v2', 'v3'];
    const validators = input.validators ?? confirmers;

    const proc = await this.processes.open({
      processId,
      processType: 'partial_release',
      institutionId: input.institutionId,
      body: {
        institutionId: input.institutionId,
        holderId: input.holderId,
        releaseAmount: formatAro(releaseArx),
        remintAmount: formatAro(remintArx),
        parentProcessId: input.parentProcessId,
        parentClaimId: input.parentClaimId,
        assetId: input.assetId,
      },
      valuation: formatAro(releaseArx),
      holderId: input.holderId,
      institutionAllowlisted: true,
      hasDocuments: input.hasDocuments ?? true,
      hasQualifiedSignature: input.hasQualifiedSignature ?? true,
    });

    const verdict = await this.pot.verify({
      process: proc,
      confirmers,
      validatorIds: validators,
      keys: this.keys,
    });
    if (verdict.verified !== 1) {
      await this.processes.abort(
        processId,
        `PoT rejected: ${verdict.reasonCodes.join(',')}`,
      );
      throw new PartialReleaseError(
        PartialReleaseErrorCode.POT_REQUIRED,
        `PoT rejected: ${verdict.reasonCodes.join(',')}`,
      );
    }
    await this.processes.markPotDone(processId, {
      potLedgerHeight: verdict.ledgerHeight,
    });

    await resolveOkToEmit(this.nodechain, processId);

    // Atomic sequence: burn(full balance) → reserve child(release) → remint(remainder)
    const burn = await this.aroscoin.burn({
      processId,
      holderId: input.holderId,
      amount: balanceBefore,
    });

    const reserveChild = await this.reserve.partialRelease({
      processId,
      amount: formatAro(releaseArx),
      parentClaimId: input.parentClaimId,
      reason: 'partial_asset_release',
    });

    let remint: PartialReleaseResult['remint'] = null;
    if (remintArx > 0n) {
      const m = await this.aroscoin.remintAfterPartialRelease({
        processId,
        holderId: input.holderId,
        amount: formatAro(remintArx),
        potLedgerHeight: verdict.ledgerHeight,
      });
      remint = {
        amount: m.amount,
        recordId: m.recordId,
        ledgerHeight: m.ledgerHeight,
      };
    }

    await this.nodechain.append({
      clientRecordId: `partial-release:${processId}`,
      recordType: 'partial_release_fact',
      processId,
      payload: {
        schemaVersion: 'partial-release-1',
        holderId: input.holderId,
        releaseAmount: formatAro(releaseArx),
        remintAmount: formatAro(remintArx),
        burnRecordId: burn.recordId,
        reserveClaimId: reserveChild.claimId,
        remintRecordId: remint?.recordId ?? null,
        parentProcessId: input.parentProcessId ?? null,
        potLedgerHeight: verdict.ledgerHeight,
      },
      writerId: 'system',
      writerRole: 'system',
    });

    await this.processes.markSettled(processId, { note: 'partial_release' });
    await this.processes.close(processId);

    return {
      processId,
      holderId: input.holderId,
      releaseAmount: formatAro(releaseArx),
      remintAmount: formatAro(remintArx),
      burn: {
        amount: burn.amount,
        recordId: burn.recordId,
        ledgerHeight: burn.ledgerHeight,
      },
      reserveChild: {
        claimId: reserveChild.claimId,
        amount: reserveChild.amount,
        parentClaimId: reserveChild.parentClaimId,
        recordId: reserveChild.recordId,
      },
      remint,
      potLedgerHeight: verdict.ledgerHeight,
      balanceAfter: this.aroscoin.balanceOf(input.holderId),
    };
  }
}
