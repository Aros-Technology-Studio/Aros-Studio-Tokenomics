import { ShowcasePackView } from '../../components/ShowcasePackView';
import { loadContentPack } from '../../lib/content-pack';

export const metadata = { title: 'Docs · AST' };

export default function DocsPage() {
  return <ShowcasePackView pack={loadContentPack('docs', 'en')} />;
}
