/** Read-only claim projection (edge-tracked process), not a wallet balance. */
export interface AssetClaim {
  claimId: string;
  processId: string;
  status: string;
  processType: string;
  valuation: string;
  holderId: string;
  assetId?: string;
  documentPackageHash: string;
  createdAt: string;
  updatedAt: string;
}
