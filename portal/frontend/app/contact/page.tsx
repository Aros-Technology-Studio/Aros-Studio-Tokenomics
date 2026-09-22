import Link from 'next/link';
import type { Metadata } from 'next';
import { Reveal } from '../../components/ui/reveal';

export const metadata: Metadata = { title: 'Contact' };

const CHANNELS = [
  {
    id: '01',
    title: 'Institutional onboarding',
    body: 'Already admitted, or applying for allowlist access — start from the sign-in page.',
  },
  {
    id: '02',
    title: 'Partnerships',
    body: 'Integrations across TECHNOlogic — AST and AFC — reach your Aros Studio contact.',
  },
  {
    id: '03',
    title: 'Press',
    body: 'For media inquiries about Aros Studio Tokenomics, reach your Aros Studio contact.',
  },
];

export default function ContactPage() {
  return (
    <section className="page">
      <div className="pad">
        <Reveal as="div" className="page__eyebrow">
          Get in touch
        </Reveal>
        <Reveal as="div" delay={1}>
          <h1 className="page__title">Contact</h1>
        </Reveal>
        <Reveal as="div" delay={2}>
          <p className="page__lead">Reach the Aros Studio team — institutional onboarding, partnerships, and press.</p>
        </Reveal>

        <Reveal as="div" delay={1} className="tl-grid tl-grid--3col">
          {CHANNELS.map((c) => (
            <div key={c.id} className="tl-card glass">
              <span className="tl-card__id">{c.id}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal as="div" delay={1} className="home-hero__cta" style={{ marginTop: 56 }}>
          <Link href="/login" className="btn-primary">
            Institution sign-in
          </Link>
          <Link href="/about" className="btn-ghost">
            About Aros Studio <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
