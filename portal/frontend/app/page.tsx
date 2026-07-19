import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="card">
      <h1>Institutional Portal</h1>
      <p className="lead">
        Secure edge for institutions to submit <strong>primary tokenization</strong> packages.
        Portal validates valuation and document evidence, then hands off to the{' '}
        <strong>Core Orchestrator</strong>. Minting happens only after PoT on NodeChain — never in
        the browser.
      </p>
      <ul className="lead">
        <li>Institutional login (allowlisted institutions)</li>
        <li>Document package hash + qualified signature attestation</li>
        <li>
          <code>processId</code> pattern <code>AST-{'{INST}'}-{'{YYYYMMDD}'}-{'{suffix}'}</code>
        </li>
        <li>Mandatory idempotency on submit</li>
      </ul>
      <p>
        <Link href="/login">
          <button type="button" className="primary">
            Institution login
          </button>
        </Link>
      </p>
      <p className="muted">
        Dev credentials: institution <code>DEMO</code> / token <code>demo-institution-token</code>
      </p>
    </div>
  );
}
