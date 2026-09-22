import type { Metadata } from 'next';
import { StubPage } from '../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Investment' };

export default function InvestmentPage() {
  return (
    <StubPage
      eyebrow="Participation"
      title="Investment"
      lead="Where recorded institutional value meets participation — the investment view of the AST economy."
    />
  );
}
