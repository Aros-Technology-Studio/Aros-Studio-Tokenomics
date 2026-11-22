import type { Metadata } from 'next';
import { DocumentRequest } from '../../../components/ui/document-request';

export const metadata: Metadata = {
  title: 'AST Docs',
  description:
    'Documentation map for Aros Studio Tokenomics: Core Canon, PoT criteria, NodeChain, token protocol and portal.',
};

/** Not published: sent on request to a verified institutional address (owner direction 2026-11-22). The pack stays in content-packs/. */
export default function AstDocsPage() {
  return <DocumentRequest title="AST documentation" />;
}
