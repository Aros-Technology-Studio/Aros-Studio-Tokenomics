import type { Metadata } from 'next';
import { DocumentRequest } from '../../components/ui/document-request';

export const metadata: Metadata = {
  title: 'Deep dive',
  description:
    'Technical deep dive: AST core modules, process lifecycle, PoT, NodeChain, security and operational defaults.',
};

/** Not published: sent on request to a verified institutional address (owner direction 2026-11-22). The pack stays in content-packs/. */
export default function DeepDivePage() {
  return <DocumentRequest title="Technical deep dive" />;
}
