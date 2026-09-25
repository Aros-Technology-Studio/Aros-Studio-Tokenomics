import type { Metadata } from 'next';
import { StubPage } from '../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Resources' };

export default function ResourcesPage() {
  return (
    <StubPage
      eyebrow="Docs & writing"
      title="Resources"
      lead="Placeholder — real copy to come."
      links={[
        { label: 'AFC Docs', href: '/resources/afc-docs' },
        { label: 'AST Docs', href: '/resources/ast-docs' },
        { label: 'Blog', href: '/resources/blog' },
        { label: 'Whitepaper', href: '/whitepaper' },
        { label: 'Deep dive', href: '/deep-dive' },
      ]}
    />
  );
}
