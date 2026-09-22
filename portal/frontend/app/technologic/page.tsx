import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'TECHNOlogic' };

/**
 * TECHNOlogic — brand hub for AST (Aros Studio Tokenomics).
 * AST-only branding per canon (docs/AST-CORE-CANON.md §X hard prohibitions,
 * "the reserve is AST's own" — no third-party/affiliate brand on the portal).
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
          The lifecycle logic behind institutional assets.
        </p>

        <div className="tl-grid">
          <Link href="/technologic/ast" className="tl-card glass">
            <span className="tl-card__id">AST</span>
            <h3>Aros Studio Tokenomics</h3>
            <p>Process token-economy: valuation recorded after confirmed work. NodeChain is the source of truth.</p>
            <span className="tl-card__go">About · Resources →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
