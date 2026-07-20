export type ProcessTypeId =
  | 'primary_tokenization'
  | 'revaluation'
  | 'ownership_transfer';

export interface ProcessRow {
  processId: string;
  status: string;
  processType: string;
  valuation: string;
  holderId: string;
  createdAt: string;
  updatedAt: string;
  documentPackageHash?: string;
}

export interface ProcessStats {
  total: number;
  submittedToCore: number;
  awaitingCore: number;
  lastSubmittedAt: string | null;
  byStatus: Record<string, number>;
}
