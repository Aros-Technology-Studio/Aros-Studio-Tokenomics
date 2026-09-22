import type { Metadata } from 'next';
import { StubPage } from '../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Institutions' };

export default function InstitutionsPage() {
  return (
    <StubPage
      eyebrow="For institutions"
      title="Institutions"
      lead="Placeholder — real copy to come."
      links={[
        { label: 'Institution sign-in', href: '/login' },
        { label: 'NodeChain', href: '/nodechain' },
      ]}
    />
  );
}
