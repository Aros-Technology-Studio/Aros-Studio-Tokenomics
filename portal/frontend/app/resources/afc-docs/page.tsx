import type { Metadata } from 'next';
import { PackPage } from '../../../components/ui/pack-page';
import { loadContentPack } from '../../../lib/content-pack';
import { getLocale } from '../../../lib/i18n/server';

export const metadata: Metadata = {
  title: 'AFC Docs',
  description:
    'Documentation map for Aros Financial Core: architecture, API contract, security model, governance and lifecycle.',
};

/** Copy lives in content-packs/afc-docs.en.md — edit the pack, not this file. */
export default async function AfcDocsPage() {
  return <PackPage pack={loadContentPack('afc-docs', await getLocale())} />;
}
