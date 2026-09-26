import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';

export const metadata: Metadata = {
  title: 'Deep dive',
  description:
    'Technical deep dive: AST core modules, process lifecycle, PoT, NodeChain, security and operational defaults.',
};

/** Copy lives in content-packs/deep-dive.en.md — edit the pack, not this file. */
export default function DeepDivePage() {
  return <PackPage pack={loadContentPack('deep-dive', 'en')} />;
}
