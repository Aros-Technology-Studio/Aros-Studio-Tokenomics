import { randomUUID } from 'crypto';
import { NodechainService } from '../nodechain/nodechain.service';
import { parseAro, formatAro } from '../common/money';
import { ReserveError, ReserveErrorCode } from './errors';
import { computeReserveIndex, internalPriceHint } from './index-math';
import {
  RESERVE_ASSET_ARO,
  type AccrualResult,
  type ReleaseResult,
  type ReserveClaim,
  type ReserveSnapshot,
} from './types';

/**
 * Layer 07 — AST own reserve only (selective custody).
 * Accrues AST commission share; tracks process volume → reserveIndex.
 * Partial release = child claims; never holds third-party participant funds.
 */
export class ReserveService {
  private ownByAsset = new Map<string, bigint>();
  private totalProcessVolumeArx = 0n;
  private claims = new Map<string, ReserveClaim>();
  private accruedProcesses = new Set<string>();
  private hydrated = false;
  private readonly priceBase: number;

  constructor(
    private readonly nodechain: NodechainService,
    opts?: { priceBase?: number },
  ) {
    this.priceBase = opts?.priceBase ?? 1;
  }

  ownBalance(assetId: string = RESERVE_ASSET_ARO): string {
    return formatAro(this.ownByAsset.get(assetId) ?? 0n);
  }

  reserveIndex(): number {
    return computeReserveIndex(this.totalProcessVolumeArx);
  }

  snapshot(): ReserveSnapshot {
    const idx = this.reserveIndex();
    return {
      ownBalanceAro: this.ownBalance(RESERVE_ASSET_ARO),
      totalProcessVolumeAro: formatAro(this.totalProcessVolumeArx),
      reserveIndex: idx,
      internalPriceHint: internalPriceHint(this.priceBase, idx),
      claims: [...this.claims.values()].sort((a, b) =>
        a.createdAtUtc.localeCompare(b.createdAtUtc),
      ),
    };
  }

  async hydrateFromJournal(): Promise<{ accruals: number; releases: number }> {
    const all = await this.nodechain.listAll();
    this.ownByAsset.clear();
    this.claims.clear();
    this.accruedProcesses.clear();
    this.totalProcessVolumeArx = 0n;
    let accruals = 0;
    let releases = 0;

    for (const r of all) {
      if (r.recordType === 'reserve_accrual' || (r.recordType === 'param_change' && r.payload?.kind === 'reserve_accrual')) {
        const amount = String(r.payload.astShare ?? r.payload.amount ?? '0');
        const assetId = String(r.payload.assetId ?? RESERVE_ASSET_ARO);
        const processId = r.processId ?? '';
        const claimId = String(r.payload.claimId ?? `legacy-${r.recordId}`);
        const arx = parseAro(amount);
        this.ownByAsset.set(assetId, (this.ownByAsset.get(assetId) ?? 0n) + arx);
        if (r.payload.processValuation) {
          this.totalProcessVolumeArx += parseAro(String(r.payload.processValuation));
        }
        if (processId) this.accruedProcesses.add(processId);
        this.claims.set(claimId, {
          claimId,
          assetId,
          amount: formatAro(arx),
          processId,
          kind: 'commission_accrual',
          createdAtUtc: r.timestampUtc,
        });
        accruals += 1;
      }
      if (r.recordType === 'reserve_release') {
        const amount = String(r.payload.amount ?? '0');
        const assetId = String(r.payload.assetId ?? RESERVE_ASSET_ARO);
        const arx = parseAro(amount);
        const bal = this.ownByAsset.get(assetId) ?? 0n;
        this.ownByAsset.set(assetId, bal - arx);
        const claimId = String(r.payload.claimId ?? r.recordId);
        this.claims.set(claimId, {
          claimId,
          assetId,
          amount: formatAro(arx),
          processId: r.processId ?? '',
          kind: 'child_release',
          parentClaimId: String(r.payload.parentClaimId ?? ''),
          createdAtUtc: r.timestampUtc,
        });
        releases += 1;
      }
    }
    this.hydrated = true;
    return { accruals, releases };
  }

  /**
   * Accrue AST share of commission into own reserve (post-factum).
   */
  async accrueFromCommission(input: {
    processId: string;
    astShare: string;
    processValuation: string;
    assetId?: string;
    claimId?: string;
  }): Promise<AccrualResult> {
    if (!input.processId?.trim()) {
      throw new ReserveError(ReserveErrorCode.INVALID_PROCESS, 'processId required');
    }
    await this.ensureHydrated();

    if (
      this.accruedProcesses.has(input.processId) ||
      (await this.journalHasAccrual(input.processId))
    ) {
      throw new ReserveError(
        ReserveErrorCode.DOUBLE_ACCRUAL,
        `reserve already accrued for ${input.processId}`,
      );
    }

    let share: bigint;
    let volume: bigint;
    try {
      share = parseAro(input.astShare);
      volume = parseAro(input.processValuation);
    } catch {
      throw new ReserveError(ReserveErrorCode.INVALID_AMOUNT, 'invalid amount');
    }
    if (share < 0n || volume < 0n) {
      throw new ReserveError(ReserveErrorCode.INVALID_AMOUNT, 'amounts must be non-negative');
    }

    const assetId = input.assetId ?? RESERVE_ASSET_ARO;
    const claimId = input.claimId ?? `rsv-${randomUUID()}`;

    this.ownByAsset.set(assetId, (this.ownByAsset.get(assetId) ?? 0n) + share);
    this.totalProcessVolumeArx += volume;
    this.accruedProcesses.add(input.processId);

    const claim: ReserveClaim = {
      claimId,
      assetId,
      amount: formatAro(share),
      processId: input.processId,
      kind: 'commission_accrual',
      createdAtUtc: new Date().toISOString(),
    };
    this.claims.set(claimId, claim);

    const r = await this.nodechain.append({
      clientRecordId: `reserve-accrual:${input.processId}`,
      recordType: 'reserve_accrual',
      processId: input.processId,
      payload: {
        claimId,
        assetId,
        amount: formatAro(share),
        astShare: formatAro(share),
        processValuation: formatAro(volume),
        ownBalance: formatAro(this.ownByAsset.get(assetId) ?? 0n),
        reserveIndex: this.reserveIndex(),
        kind: 'commission_accrual',
        note: 'AST own funds only',
      },
      writerId: 'system',
      writerRole: 'system',
    });

    return {
      processId: input.processId,
      claimId,
      assetId,
      amount: formatAro(share),
      ownBalance: formatAro(this.ownByAsset.get(assetId) ?? 0n),
      reserveIndex: this.reserveIndex(),
      ledgerHeight: r.height,
      recordId: r.recordId,
    };
  }

  /**
   * Partial release of own reserve as a child claim (hard fail if insufficient).
   */
  async partialRelease(input: {
    processId: string;
    amount: string;
    parentClaimId?: string;
    assetId?: string;
    claimId?: string;
    reason?: string;
  }): Promise<ReleaseResult> {
    if (!input.processId?.trim()) {
      throw new ReserveError(ReserveErrorCode.INVALID_PROCESS, 'processId required');
    }
    await this.ensureHydrated();

    const assetId = input.assetId ?? RESERVE_ASSET_ARO;
    let arx: bigint;
    try {
      arx = parseAro(input.amount);
    } catch {
      throw new ReserveError(ReserveErrorCode.INVALID_AMOUNT, 'invalid amount');
    }
    if (arx <= 0n) {
      throw new ReserveError(ReserveErrorCode.INVALID_AMOUNT, 'amount must be positive');
    }

    const bal = this.ownByAsset.get(assetId) ?? 0n;
    if (bal < arx) {
      throw new ReserveError(ReserveErrorCode.INSUFFICIENT, 'insufficient reserve');
    }

    if (input.parentClaimId && !this.claims.has(input.parentClaimId)) {
      throw new ReserveError(ReserveErrorCode.UNKNOWN_CLAIM, 'parent claim not found');
    }

    const claimId = input.claimId ?? `rsv-rel-${randomUUID()}`;
    this.ownByAsset.set(assetId, bal - arx);

    const child: ReserveClaim = {
      claimId,
      assetId,
      amount: formatAro(arx),
      processId: input.processId,
      kind: 'child_release',
      parentClaimId: input.parentClaimId,
      createdAtUtc: new Date().toISOString(),
    };
    this.claims.set(claimId, child);

    const r = await this.nodechain.append({
      clientRecordId: `reserve-release:${input.processId}:${claimId}`,
      recordType: 'reserve_release',
      processId: input.processId,
      payload: {
        claimId,
        parentClaimId: input.parentClaimId ?? null,
        assetId,
        amount: formatAro(arx),
        ownBalance: formatAro(this.ownByAsset.get(assetId) ?? 0n),
        reason: input.reason ?? 'partial_release',
      },
      writerId: 'system',
      writerRole: 'system',
    });

    return {
      processId: input.processId,
      claimId,
      parentClaimId: input.parentClaimId ?? '',
      amount: formatAro(arx),
      ownBalance: formatAro(this.ownByAsset.get(assetId) ?? 0n),
      ledgerHeight: r.height,
      recordId: r.recordId,
    };
  }

  private async ensureHydrated(): Promise<void> {
    if (!this.hydrated) await this.hydrateFromJournal();
  }

  private async journalHasAccrual(processId: string): Promise<boolean> {
    const rows = await this.nodechain.listByProcessId(processId);
    return rows.some(
      (r) =>
        r.recordType === 'reserve_accrual' ||
        (r.recordType === 'param_change' && r.payload?.kind === 'reserve_accrual'),
    );
  }
}
