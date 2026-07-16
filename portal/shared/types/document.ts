export interface DocumentUploadResponse {
  documentId: string;
  processId: string;
  status: 'accepted' | 'rejected';
  rejectionReason?: string | null;
}
