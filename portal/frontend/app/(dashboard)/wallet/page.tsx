import type { Metadata } from 'next';
import { StubPage } from '../../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Wallet' };

export default function WalletPage() {
  return (
    <StubPage
      eyebrow="Cabinet"
      title="Wallet"
      lead="Placeholder — real copy to come."
    />
  );
}
