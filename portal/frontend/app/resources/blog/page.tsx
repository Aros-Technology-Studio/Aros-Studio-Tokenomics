import type { Metadata } from 'next';
import { StubPage } from '../../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Blog' };

export default function BlogPage() {
  return (
    <StubPage eyebrow="Resources" title="Blog" lead="Notes and updates from Aros Studio." />
  );
}
