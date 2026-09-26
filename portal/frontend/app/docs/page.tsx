import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';

export const metadata: Metadata = { title: 'Docs' };

/** Copy lives in content-packs/docs.en.md — edit the pack, not this file. */
export default function DocsPage() {
  return <PackPage pack={loadContentPack('docs', 'en')} />;
}
