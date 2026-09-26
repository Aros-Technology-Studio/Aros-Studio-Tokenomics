import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Documentation, white paper, technical deep dive, blog and key terms for Aros Studio Tokenomics (AST) and Aros Financial Core (AFC).',
};

/** Copy lives in content-packs/resources.en.md — edit the pack, not this file. */
export default function ResourcesPage() {
  return <PackPage pack={loadContentPack('resources', 'en')} />;
}
