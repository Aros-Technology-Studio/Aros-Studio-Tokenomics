import { ShowcasePackView } from '../../components/ShowcasePackView';
import { loadContentPack } from '../../lib/content-pack';

export const metadata = { title: 'White paper · AST' };

export default function WhitepaperPage() {
  return <ShowcasePackView pack={loadContentPack('whitepaper', 'en')} />;
}
