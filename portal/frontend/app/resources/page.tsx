import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';
import { getLocale } from '../../lib/i18n/server';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Documentation, white paper, technical deep dive, blog and key terms for Aros Studio Tokenomics (AST) and Aros Financial Core (AFC).',
};

/** Copy lives in content-packs/resources.en.md — edit the pack, not this file. */
export default async function ResourcesPage() {
  return <PackPage pack={loadContentPack('resources', await getLocale())} />;
}
