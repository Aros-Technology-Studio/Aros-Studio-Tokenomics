import type { Metadata } from 'next';
import { PackPage } from '../../../components/ui/pack-page';
import { loadContentPack } from '../../../lib/content-pack';
import { getLocale } from '../../../lib/i18n/server';

export const metadata: Metadata = {
  title: 'AST Docs',
  description:
    'Documentation map for Aros Studio Tokenomics: Core Canon, PoT criteria, NodeChain, token protocol and portal.',
};

/** Copy lives in content-packs/ast-docs.en.md — edit the pack, not this file. */
export default async function AstDocsPage() {
  return <PackPage pack={loadContentPack('ast-docs', await getLocale())} />;
}
