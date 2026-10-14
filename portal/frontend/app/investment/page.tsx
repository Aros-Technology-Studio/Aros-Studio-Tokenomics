import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';

export const metadata: Metadata = {
  title: 'Investment',
  description:
    'For investors and strategic partners: the problem AST and AFC address, the business model, current status, and how to participate. No token sale.',
};

/** Copy lives in content-packs/investment.en.md — edit the pack, not this file. */
export default function InvestmentPage() {
  return <PackPage pack={loadContentPack('investment', 'en')} />;
}
