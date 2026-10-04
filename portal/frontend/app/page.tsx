import Link from 'next/link';
import { Reveal } from '../components/ui/reveal';
import { ChainDiagram } from '../components/ui/chain-diagram';

/**
 * Home (Welcome). Hero + closing CTA, ported from the design artifact.
 * Navigation + footer come from the shared shell, not from this page.
 * (Chain / PoT-gate / principles narrative sections were cut per direction —
 * this page will likely be revisited; keep it lean for now.)
 *
 * Hero: big mark left-aligned, ~20-25px under the nav, with the tagline
 * underneath — per owner direction (no scroll animation this time).
 */
export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="home-hero">
        <div className="pad">
          <Reveal as="div" className="home-hero__mark">
            <img src="/brand/aros-infinity-white.png" alt="Aros Studio" width={414} height={258} />
          </Reveal>
          <Reveal as="div" delay={1}>
            <h1 className="home-hero__title">
              Any
              <br />
              institutional asset
              <br />
              in any jurisdiction
            </h1>
          </Reveal>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </section>

      {/* POT CHAIN */}
      <section className="chain-section">
        <div className="pad">
          <Reveal as="div">
            <h2>
              One gate. Every token,
              <br />
              the same five steps.
            </h2>
          </Reveal>
          <Reveal as="div" delay={1}>
            <p>
              No positive <strong>Proof of Transaction</strong> verdict, no value. There is no
              pre-mine and no free issuance — every AST token earns its place on NodeChain
              through the same confirmed path.
            </p>
          </Reveal>
          <Reveal as="div" delay={2}>
            <ChainDiagram />
          </Reveal>
        </div>
      </section>

      {/* CLOSING */}
      <section className="close">
        <div className="pad">
          <Reveal as="div">
            <h2>
              Lifecycle logic
              <br />
              for institutional assets.
            </h2>
          </Reveal>
          <Reveal as="div" delay={1}>
            <p>
              AST records <strong>already-confirmed institutional value</strong> as a living
              token — and <strong>NodeChain</strong> remembers every move of it.
            </p>
          </Reveal>
          <Reveal as="div" delay={2}>
            <Link href="/login" className="btn-primary">
              Enter the portal
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
