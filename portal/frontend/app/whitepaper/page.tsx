import type { Metadata } from 'next';
import { DocumentRequest } from '../../components/ui/document-request';

export const metadata: Metadata = {
  title: 'White paper',
  description:
    'AST and AFC white paper: first principles, formal model, formulas and boundaries.',
};

/** Not published: sent on request to a verified institutional address (owner direction 2026-11-22). The pack stays in content-packs/. */
export default function WhitepaperPage() {
  return <DocumentRequest title="White paper" />;
}
