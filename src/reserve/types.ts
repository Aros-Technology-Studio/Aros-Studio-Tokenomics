export const RESERVE_ASSET_ARO = 'ARO';

export interface ReserveClaim {
  claimId: string;
  assetId: string;
  amount: string;
  processId: string;
  kind: 'commission_accrual' | 'manual' | 'child_release';
  parentClaimId?: string;
  createdAtUtc: string;
}

export interface ReserveSnapshot {
  ownBalanceAro: string;
  totalProcessVolumeAro: string;
  reserveIndex: number;
  /** Informational only — not market price (Canon §9.3). */
  internalPriceHint: number;
  claims: ReserveClaim[];
}

export interface AccrualResult {
  processId: string;
  claimId: string;
  assetId: string;
  amount: string;
  ownBalance: string;
  reserveIndex: number;
  ledgerHeight: number;
  recordId: string;
}

export interface ReleaseResult {
  processId: string;
  claimId: string;
  parentClaimId: string;
  amount: string;
  ownBalance: string;
  ledgerHeight: number;
  recordId: string;
}
