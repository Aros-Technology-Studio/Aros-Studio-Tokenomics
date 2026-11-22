import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';
import { getLocale } from '../../lib/i18n/server';

export const metadata: Metadata = { title: 'Docs' };

/** Copy lives in content-packs/docs.en.md — edit the pack, not this file. */
export default async function DocsPage() {
  return <PackPage pack={loadContentPack('docs', await getLocale())} />;
}
