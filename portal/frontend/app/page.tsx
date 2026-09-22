import Link from 'next/link';
import { Reveal } from '../components/ui/reveal';

/**
 * Home (Welcome). Hero + closing CTA, ported from the design artifact.
 * Navigation + footer come from the shared shell, not from this page.
 * (Chain / PoT-gate / principles narrative sections were cut per direction —
 * this page will likely be revisited; keep it lean for now.)
 */
export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="home-hero">
        <div className="pad">
          <Reveal as="div" className="home-hero__mark">
            <img
              src="/brand/aros-infinity-white.png"
              alt="Aros Studio"
              width={208}
              height={130}
            />
          </Reveal>
          <Reveal as="div" delay={1}>
            <h1 className="home-hero__title">
              Lifecycle logic
              <br />
              for institutional assets.
            </h1>
          </Reveal>
          <Reveal as="div" delay={2}>
            <p className="home-hero__lead">
              AST records <strong>already-confirmed institutional value</strong> as a living
              token — and <strong>NodeChain</strong> remembers every move of it.
            </p>
          </Reveal>
          <Reveal as="div" delay={3} className="home-hero__cta">
            <Link href="/nodechain" className="btn-primary">
              Explore the journal
            </Link>
            <Link href="/login" className="btn-ghost">
              Institution sign-in <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </section>

      {/* CLOSING */}
      <section className="close">
        <div className="pad">
          <Reveal as="div">
            <h2>
              Recorded once.
              <br />
              Trusted forever.
            </h2>
          </Reveal>
          <Reveal as="div" delay={1}>
            <p>
              AST holds only its own value. It never appraises, never custodies, never rewrites.
              It remembers.
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
