import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System',
};

export default function SystemPage() {
  return (
    <>
      <section className="card hero">
        <p className="eyebrow">System boundaries</p>
        <h1>What AST is — and what it refuses</h1>
        <p className="lead lead-wide">
          Clarity builds trust. Below is the public boundary of Aros Studio Tokenomics as exposed
          through this portal. Full law lives in Core Canon; this page is the outside-world
          summary.
        </p>
      </section>

      <div className="grid2">
        <div className="card can">
          <h2 className="ok">What it can do</h2>
          <ul className="plain-list">
            <li>Accept an official institutional valuation package</li>
            <li>Require document evidence + qualified signature attestation</li>
            <li>Hand off to Core Orchestrator for PoT-gated settlement</li>
            <li>Record significant process states on NodeChain (Core path)</li>
            <li>Pay infrastructure post-factum after confirmed work</li>
            <li>Let anyone look up a known processId (read-only)</li>
          </ul>
        </div>
        <div className="card cannot">
          <h2 className="err" style={{ marginTop: 0 }}>
            What it cannot / will not do
          </h2>
          <ul className="plain-list">
            <li>Appraise assets or invent market prices</li>
            <li>Mint ARO in the browser or portal edge</li>
            <li>Act as a bank, exchange, or custodian of client funds</li>
            <li>Open free self-signup for retail “anyone mints”</li>
            <li>Let public users write or edit NodeChain</li>
            <li>Offer staking, farming, or passive yield for holding</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2>How the pieces fit</h2>
        <div className="timeline">
          <div className="item done">
            <div className="t">Portal (this site)</div>
            <div className="d">Public story · explorer · institutional edge admission</div>
          </div>
          <div className="item done">
            <div className="t">Core Orchestrator</div>
            <div className="d">Sole economic entry for the process path</div>
          </div>
          <div className="item active">
            <div className="t">PoT</div>
            <div className="d">Proof that the process is validly confirmed</div>
          </div>
          <div className="item">
            <div className="t">NodeChain</div>
            <div className="d">Append-only source of truth for significant states</div>
          </div>
        </div>
      </div>

      <div className="callout">
        <strong>NodeChain & transparency.</strong> You do not need registration to ask “what is the
        status of process X?”. You need a processId. You still cannot mint, reverse, or rewrite
        history from this site.
      </div>

      <div className="actions">
        <Link href="/explore">
          <button type="button" className="primary">
            Open public explorer
          </button>
        </Link>
        <Link href="/about">
          <button type="button" className="secondary">
            About
          </button>
        </Link>
      </div>
    </>
  );
}
