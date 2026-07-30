import { ShowcasePackView } from '../../components/ShowcasePackView';
import { loadContentPack } from '../../lib/content-pack';

export const metadata = { title: 'Deep dive · AST' };

export default function DeepDivePage() {
  return <ShowcasePackView pack={loadContentPack('deep-dive', 'en')} />;
}
