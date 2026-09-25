import type { Metadata } from 'next';
import { StubPage } from '../../../components/ui/stub-page';

export const metadata: Metadata = { title: 'AST Docs' };

export default function AstDocsPage() {
  return (
    <StubPage eyebrow="Resources" title="AST Docs" lead="Documentation for Aros Studio Tokenomics." links={[{ label: 'Whitepaper', href: '/whitepaper' }, { label: 'Deep dive', href: '/deep-dive' }]} />
  );
}
