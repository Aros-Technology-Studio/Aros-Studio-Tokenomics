import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="card hero">
        <p className="muted" style={{ marginTop: 0 }}>
          Institutional clients
        </p>
        <h1>Primary tokenization, governed end-to-end</h1>
        <p className="lead">
          Submit institutional valuation packages through a secure edge portal. The portal
          authenticates your institution, hashes documents, and hands off to the{' '}
          <strong>Core Orchestrator</strong>. Minting happens only after PoT on NodeChain —
          never in the browser.
        </p>
        <div className="actions">
          <Link href="/login">
            <button type="button" className="primary">
              Institution login
            </button>
          </Link>
          <Link href="/dashboard">
            <button type="button" className="secondary">
              Open dashboard
            </button>
          </Link>
        </div>
        <p className="muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
          Demo: institution <code>DEMO</code> · token <code>demo-institution-token</code>
        </p>
      </section>

      <ul className="feature-list">
        <li>
          <strong>Allowlisted access</strong>
          <span>Session-bound institution credentials. Spoofed headers are rejected.</span>
        </li>
        <li>
          <strong>Document package hash</strong>
          <span>SHA-256 of certificates and package parts at the edge — no edge SoT store.</span>
        </li>
        <li>
          <strong>Idempotent submit</strong>
          <span>
            Mandatory <code>Idempotency-Key</code> and processId{' '}
            <code>AST-{'{INST}'}-{'{YYYYMMDD}'}-…</code>
          </span>
        </li>
        <li>
          <strong>Core hand-off only</strong>
          <span>Portal never mints, burns, or rewrites NodeChain. Fail-closed if Core is down.</span>
        </li>
      </ul>

      <div className="card flat" style={{ marginTop: '1rem' }}>
        <h2>Process path</h2>
        <div className="timeline">
          <div className="item done">
            <div className="t">1. Login</div>
            <div className="d">Institution session on the portal edge</div>
          </div>
          <div className="item done">
            <div className="t">2. Package</div>
            <div className="d">Valuation + document hash + qualified signature flag</div>
          </div>
          <div className="item active">
            <div className="t">3. Core Orchestrator</div>
            <div className="d">Governance L1–L3 · PoT P1–P4 · economic settle</div>
          </div>
          <div className="item">
            <div className="t">4. Status</div>
            <div className="d">Track edge record merged with Core process state</div>
          </div>
        </div>
      </div>
    </>
  );
}
