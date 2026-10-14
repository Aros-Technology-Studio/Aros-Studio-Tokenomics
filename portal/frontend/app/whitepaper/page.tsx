import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';

export const metadata: Metadata = {
  title: 'White paper',
  description:
    'AST and AFC white paper: first principles, formal model, formulas and boundaries.',
};

/** Copy lives in content-packs/whitepaper.en.md — edit the pack, not this file. */
export default function WhitepaperPage() {
  return <PackPage pack={loadContentPack('whitepaper', 'en')} />;
}
