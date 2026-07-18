export const TOKEN_SCHEMA = 'aroscoin-1';
export const ARO_DECIMALS = 9;
export const ARO_SYMBOL = 'ARO';

export interface MintResult {
  processId: string;
  claimId: string;
  holderId: string;
  amount: string;
  potLedgerHeight: number;
  ledgerHeight: number;
  recordId: string;
  totalSupply: string;
}

export interface BurnResult {
  processId: string;
  claimId: string;
  holderId: string;
  amount: string;
  ledgerHeight: number;
  recordId: string;
  totalSupply: string;
}

export interface TransferResult {
  processId: string;
  claimId: string;
  fromHolderId: string;
  toHolderId: string;
  amount: string;
  potLedgerHeight: number;
  ledgerHeight: number;
  recordId: string;
}

export interface RevaluationResult {
  processId: string;
  previousValue: string;
  newValue: string;
  deltaValue: string;
  supplyBefore: string;
  supplyAfter: string;
  allocations: Array<{ holderId: string; delta: string }>;
  potLedgerHeight: number;
  ledgerHeight: number;
  recordId: string;
}

export interface TokenSnapshot {
  symbol: typeof ARO_SYMBOL;
  decimals: typeof ARO_DECIMALS;
  totalSupply: string;
  holders: Array<{ holderId: string; balance: string }>;
  mintedProcessIds: string[];
}
