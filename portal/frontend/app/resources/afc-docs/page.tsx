import type { Metadata } from 'next';
import { DocumentRequest } from '../../../components/ui/document-request';

export const metadata: Metadata = {
  title: 'AFC Docs',
  description:
    'Documentation map for Aros Financial Core: architecture, API contract, security model, governance and lifecycle.',
};

/** Not published: sent on request to a verified institutional address (owner direction 2026-11-22). The pack stays in content-packs/. */
export default function AfcDocsPage() {
  return <DocumentRequest title="AFC documentation" />;
}
