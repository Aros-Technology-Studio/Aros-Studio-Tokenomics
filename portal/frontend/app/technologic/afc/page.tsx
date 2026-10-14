import type { Metadata } from 'next';
import { PackPage } from '../../../components/ui/pack-page';
import { loadContentPack } from '../../../lib/content-pack';

export const metadata: Metadata = {
  title: 'Aros Financial Core (AFC)',
  description:
    'Aros Financial Core (AFC) is the process of executing the Aros API Contract between independent, licensed parties. Non-custodial by design, auditable at every step.',
};

/** Copy lives in content-packs/technologic-afc.en.md — edit the pack, not this file. */
export default function TechnologicAfcPage() {
  return <PackPage pack={loadContentPack('technologic-afc', 'en')} />;
}
