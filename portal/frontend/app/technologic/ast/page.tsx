import type { Metadata } from 'next';
import { PackPage } from '../../../components/ui/pack-page';
import { loadContentPack } from '../../../lib/content-pack';
import { getLocale } from '../../../lib/i18n/server';

export const metadata: Metadata = {
  title: 'Aros Studio Tokenomics (AST)',
  description:
    'AST records already-confirmed institutional valuation as a token of rights. Value arises only through Proof of Transaction; NodeChain is the source of truth.',
};

/** Copy lives in content-packs/technologic-ast.en.md — edit the pack, not this file. */
export default async function TechnologicAstPage() {
  return <PackPage pack={loadContentPack('technologic-ast', await getLocale())} />;
}
