import type { Metadata } from 'next';
import { StubPage } from '../../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Setting' };

export default function SettingPage() {
  return (
    <StubPage
      eyebrow="Cabinet"
      title="Setting"
      lead="Placeholder — real copy to come."
    />
  );
}
