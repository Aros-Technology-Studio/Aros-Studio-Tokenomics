import type { Metadata } from 'next';
import { StubPage } from '../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Institutions' };

export default function InstitutionsPage() {
  return (
    <StubPage
      eyebrow="For institutions"
      title="Institutions"
      lead="How admitted institutions onboard, submit confirmed work, and read valuations back from NodeChain."
      links={[
        { label: 'Institution sign-in', href: '/login' },
        { label: 'NodeChain', href: '/nodechain' },
      ]}
    />
  );
}
