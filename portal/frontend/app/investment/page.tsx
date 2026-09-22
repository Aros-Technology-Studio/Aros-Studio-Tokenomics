import type { Metadata } from 'next';
import { StubPage } from '../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Investment' };

export default function InvestmentPage() {
  return (
    <StubPage
      eyebrow="Participation"
      title="Investment"
      lead="Placeholder — real copy to come."
    />
  );
}
