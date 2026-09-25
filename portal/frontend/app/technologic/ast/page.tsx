import type { Metadata } from 'next';
import { StubPage } from '../../../components/ui/stub-page';

export const metadata: Metadata = { title: 'AST' };

export default function AstPage() {
  return (
    <StubPage
      eyebrow="TECHNOlogic · AST"
      title="Aros Studio Tokenomics"
      lead="Process token-economy: value arises only through a confirmed process, recorded append-only in NodeChain."
      links={[
        { label: 'About', href: '/about' },
        { label: 'Resources', href: '/resources/ast-docs' },
        { label: 'NodeChain', href: '/nodechain' },
        { label: 'AST Portal', href: '/login' },
      ]}
    />
  );
}
