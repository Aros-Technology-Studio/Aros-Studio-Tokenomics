import Link from 'next/link';
import type { Metadata } from 'next';
import { Reveal } from '../../components/ui/reveal';

export const metadata: Metadata = { title: 'Resources' };

const RESOURCES = [
  {
    id: 'AFC',
    title: 'AFC Docs',
    body: 'Documentation for Aros Financial Core — the settlement and institutional rails layer.',
    href: '/resources/afc-docs',
  },
  {
    id: 'AST',
    title: 'AST Docs',
    body: 'Documentation for Aros Studio Tokenomics — NodeChain, Proof of Transaction, the portal.',
    href: '/resources/ast-docs',
  },
  {
    id: '—',
    title: 'Blog',
    body: 'Notes and updates from Aros Studio.',
    href: '/resources/blog',
  },
  {
    id: 'PDF',
    title: 'Whitepaper',
    body: 'The full write-up of the process token-economy and its guarantees.',
    href: '/whitepaper',
  },
  {
    id: '→',
    title: 'Deep dive',
    body: 'A closer look at the mechanics behind NodeChain and PoT.',
    href: '/deep-dive',
  },
];

export default function ResourcesPage() {
  return (
    <section className="page">
      <div className="pad">
        <Reveal as="div" className="page__eyebrow">
          Docs & writing
        </Reveal>
        <Reveal as="div" delay={1}>
          <h1 className="page__title">Resources</h1>
        </Reveal>
        <Reveal as="div" delay={2}>
          <p className="page__lead">Documentation and writing across both engines.</p>
        </Reveal>

        <Reveal as="div" delay={1} className="tl-grid tl-grid--3col">
          {RESOURCES.map((r) => (
            <Link key={r.href} href={r.href} className="tl-card glass">
              <span className="tl-card__id">{r.id}</span>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              <span className="tl-card__go">Open →</span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
