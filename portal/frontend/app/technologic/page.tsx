import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'TECHNOlogic' };

/**
 * TECHNOlogic — brand hub. Splits into AST and AFC, each with About + Resources.
 */
export default function TechnologicPage() {
  return (
    <section className="home-hero">
      <div className="pad">
        <p className="page__eyebrow">Aros Studio</p>
        <h1 className="home-hero__title" style={{ fontWeight: 800 }}>
          TECHNO<span style={{ fontStyle: 'italic', fontWeight: 400 }}>logic</span>
        </h1>
        <p className="home-hero__lead">
          The lifecycle logic behind institutional assets — two engines under one method.
        </p>

        <div className="tl-grid">
          <Link href="/technologic/ast" className="tl-card glass">
            <img
              src="/brand/ast-mark-white.png"
              alt="AST"
              className="tl-card__mark"
              width={28}
              height={15}
            />
            <h3>Aros Studio Tokenomics</h3>
            <p>Process token-economy: valuation recorded after confirmed work. NodeChain is the source of truth.</p>
            <span className="tl-card__go">About · Resources →</span>
          </Link>
          <Link href="/technologic/afc" className="tl-card glass">
            <img
              src="/brand/afc-mark-white.png"
              alt="AFC"
              className="tl-card__mark"
              width={28}
              height={16}
            />
            <h3>Aros Financial Core</h3>
            <p>The financial core layer. Settlement and institutional rails around the confirmed process.</p>
            <span className="tl-card__go">About · Resources →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
