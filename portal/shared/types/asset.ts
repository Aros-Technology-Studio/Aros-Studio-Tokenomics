export interface AssetSummary {
  claimId: string;
  assetType: string;
  currentValuation: string;
  tokenSupply: string;
  status: string;
}

export interface AssetDetail extends AssetSummary {
  processHistory?: Record<string, unknown>[];
  ownership?: Record<string, unknown>[];
}
