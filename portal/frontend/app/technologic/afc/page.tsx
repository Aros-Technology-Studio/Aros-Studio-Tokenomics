import type { Metadata } from 'next';
import { StubPage } from '../../../components/ui/stub-page';

export const metadata: Metadata = { title: 'AFC' };

export default function AfcPage() {
  return (
    <StubPage
      eyebrow="TECHNOlogic · AFC"
      title="Aros Financial Core"
      lead="The financial core layer — settlement and institutional rails around the confirmed process."
      links={[
        { label: 'About', href: '/about' },
        { label: 'Resources', href: '/resources/afc-docs' },
      ]}
    />
  );
}
