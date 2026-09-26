import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';

export const metadata: Metadata = {
  title: 'Institutions',
  description:
    'How central banks, regulators, ministries, banks and licensed digital-asset firms work with AST and AFC — scope, responsibilities, and how an engagement runs.',
};

/** Copy lives in content-packs/institutions.en.md — edit the pack, not this file. */
export default function InstitutionsPage() {
  return <PackPage pack={loadContentPack('institutions', 'en')} />;
}
