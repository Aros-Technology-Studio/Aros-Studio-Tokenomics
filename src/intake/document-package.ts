import { createHash } from 'crypto';
import { canonicalJson } from '../nodechain/hash';

export interface DocumentPackage {
  documents: Array<{ name: string; contentHash: string; mediaType?: string }>;
  hasQualifiedSignature: boolean;
  signerId?: string;
  packageNote?: string;
}

export function hashDocumentPackage(pkg: DocumentPackage): string {
  return createHash('sha256').update(canonicalJson(pkg)).digest('hex');
}

export function assertDocumentPackage(pkg: DocumentPackage): void {
  if (!pkg.documents?.length) {
    throw new Error('document package must include at least one document');
  }
  for (const d of pkg.documents) {
    if (!d.name || !d.contentHash) {
      throw new Error('each document needs name and contentHash');
    }
  }
  if (pkg.hasQualifiedSignature !== true) {
    throw new Error('qualified signature required on document package');
  }
}
