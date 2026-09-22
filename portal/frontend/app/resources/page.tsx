import type { Metadata } from 'next';
import { StubPage } from '../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Resources' };

export default function ResourcesPage() {
  return (
    <StubPage
      eyebrow="Docs & writing"
      title="Resources"
      lead="Documentation and writing across both engines."
      links={[
        { label: 'AFC Docs', href: '/resources/afc-docs' },
        { label: 'AST Docs', href: '/resources/ast-docs' },
        { label: 'Blog', href: '/resources/blog' },
      ]}
    />
  );
}
