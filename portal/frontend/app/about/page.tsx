import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <>
      <section className="card hero">
        <p className="eyebrow">About</p>
        <h1>Aros Financial Core</h1>
        <p className="lead lead-wide">
          We connect institutional processes to <strong>Aros Studio Tokenomics (AST)</strong> — a
          system where digital units appear only after confirmed work (Proof of Transaction), and
          significant states are recorded on NodeChain.
        </p>
      </section>

      <div className="card">
        <h2>Who we are talking to</h2>
        <p className="lead">
          Institutions that already hold official valuations and need a disciplined path into a
          digital registry of rights — not a retail exchange, not a speculative token launch.
        </p>
        <p className="lead">
          And the public: journalists, counterparties, auditors, partners who need to{' '}
          <strong>see what the system is</strong> and <strong>check a process id</strong> without
          asking for a private key.
        </p>
      </div>

      <div className="grid2">
        <div className="card flat">
          <h2>Mission</h2>
          <p className="muted">
            Record institutional valuation accurately and verifiably. Value is not invented in the
            portal. It is accepted as given by the institution, then gated by PoT on Core.
          </p>
        </div>
        <div className="card flat">
          <h2>This website</h2>
          <p className="muted">
            Public story + public explorer + institutional cabinet. Edge software only. NodeChain
            is not rewritten here.
          </p>
        </div>
      </div>

      <div className="actions" style={{ marginTop: '0.5rem' }}>
        <Link href="/system">
          <button type="button" className="primary">
            System: can & cannot
          </button>
        </Link>
        <Link href="/explore">
          <button type="button" className="secondary">
            Explore a process
          </button>
        </Link>
      </div>
    </>
  );
}
