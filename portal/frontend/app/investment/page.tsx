import Link from 'next/link';
import type { Metadata } from 'next';
import { Reveal } from '../../components/ui/reveal';

export const metadata: Metadata = { title: 'Investment' };

export default function InvestmentPage() {
  return (
    <section className="page">
      <div className="pad">
        <Reveal as="div" className="page__eyebrow">
          Participation
        </Reveal>
        <Reveal as="div" delay={1}>
          <h1 className="page__title">Investment</h1>
        </Reveal>
        <Reveal as="div" delay={2}>
          <p className="page__lead">
            AST does not sell a promise of future value. It records <strong>value that
            institutions have already confirmed</strong> — participation follows that record,
            not the other way around.
          </p>
        </Reveal>

        <Reveal as="div" delay={1} className="tl-grid">
          <div className="tl-card glass">
            <span className="tl-card__id">01</span>
            <h3>Confirmed, not projected</h3>
            <p>Units appear only after Proof of Transaction — no roadmap-based issuance.</p>
          </div>
          <div className="tl-card glass">
            <span className="tl-card__id">02</span>
            <h3>Deterministic economy</h3>
            <p>Same inputs, same result. No discretionary emission outside a confirmed process.</p>
          </div>
        </Reveal>

        <div className="band" style={{ marginTop: 56 }}>
          <Reveal as="div" delay={1}>
            <div className="n">0</div>
            <div className="l">Pre-mine</div>
          </Reveal>
          <Reveal as="div" delay={2}>
            <div className="n">0</div>
            <div className="l">Staking rewards</div>
          </Reveal>
          <Reveal as="div" delay={3}>
            <div className="n">100%</div>
            <div className="l">On-chain validity</div>
          </Reveal>
          <Reveal as="div" delay={4}>
            <div className="n">Ed25519</div>
            <div className="l">Signed records</div>
          </Reveal>
        </div>

        <Reveal as="div" delay={1} className="home-hero__cta" style={{ marginTop: 56 }}>
          <Link href="/whitepaper" className="btn-primary">
            Read the whitepaper
          </Link>
          <Link href="/nodechain" className="btn-ghost">
            Verify on NodeChain <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
