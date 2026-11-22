import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';
import { getLocale } from '../../lib/i18n/server';

export const metadata: Metadata = {
  title: 'Showcase',
  description:
    'Aros Studio Tokenomics showcase: document-first institutional tokenization on NodeChain.',
};

/** Copy lives in content-packs/showcase-home.en.md — edit the pack, not this file. */
export default async function ShowcaseHomePage() {
  return <PackPage pack={loadContentPack('showcase-home', await getLocale())} />;
}
