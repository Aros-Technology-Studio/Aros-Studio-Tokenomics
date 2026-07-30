import { ShowcasePackView } from '../../components/ShowcasePackView';
import { loadContentPack } from '../../lib/content-pack';

export const metadata = {
  title: 'Showcase · AST',
  description: 'Public showcase front door for Aros Studio Tokenomics',
};

export default function ShowcaseHomePage() {
  const pack = loadContentPack('showcase-home', 'en');
  return <ShowcasePackView pack={pack} />;
}
