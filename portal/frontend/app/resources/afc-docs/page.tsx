import type { Metadata } from 'next';
import { PackPage } from '../../../components/ui/pack-page';
import { loadContentPack } from '../../../lib/content-pack';

export const metadata: Metadata = {
  title: 'AFC Docs',
  description:
    'Documentation map for Aros Financial Core: architecture, API contract, security model, governance and lifecycle.',
};

/** Copy lives in content-packs/afc-docs.en.md — edit the pack, not this file. */
export default function AfcDocsPage() {
  return <PackPage pack={loadContentPack('afc-docs', 'en')} />;
}
