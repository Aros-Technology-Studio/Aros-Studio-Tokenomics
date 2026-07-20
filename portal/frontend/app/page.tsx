import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="card hero hero-public">
        <p className="eyebrow">Aros Studio Tokenomics · public face</p>
        <h1>Institutional value, recorded with proof — not speculation</h1>
        <p className="lead lead-wide">
          Aros Financial Core is how the outside world meets <strong>AST</strong>: a system that
          turns confirmed institutional valuation into a process-bound digital record. Minting
          only after Proof of Transaction on NodeChain. No free float theater. No bank costume.
        </p>
        <div className="actions">
          <Link href="/explore">
            <button type="button" className="primary">
              Look up a process
            </button>
          </Link>
          <Link href="/system">
            <button type="button" className="secondary">
              What AST can & cannot
            </button>
          </Link>
          <Link href="/login">
            <button type="button" className="ghost">
              Institution cabinet
            </button>
          </Link>
        </div>
      </section>

      <div className="kpis kpis-public">
        <div className="kpi">
          <div className="label">For everyone</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            Public explorer
          </div>
          <div className="hint">No registration · no special key · read-only</div>
        </div>
        <div className="kpi">
          <div className="label">For institutions</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            Secure cabinet
          </div>
          <div className="hint">Allowlisted login · package admit · status</div>
        </div>
        <div className="kpi">
          <div className="label">Source of truth</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            NodeChain
          </div>
          <div className="hint">After Core · after PoT — not the browser</div>
        </div>
        <div className="kpi">
          <div className="label">Portal never</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            Mints ARO
          </div>
          <div className="hint">Edge only · fail-closed if Core is down</div>
        </div>
      </div>

      <ul className="feature-list">
        <li>
          <strong>Transparency</strong>
          <span>
            Search a <code>processId</code> and see status without logging in. Trust is
            verifiable, not marketed only.
          </span>
        </li>
        <li>
          <strong>Institutional path</strong>
          <span>
            Allowlisted clients submit valuation + documents + signature attestation. Hand-off to
            Orchestrator.
          </span>
        </li>
        <li>
          <strong>Clear boundaries</strong>
          <span>
            We explain what the system does and what it refuses — appraisal, custody, free
            emission, retail self-signup.
          </span>
        </li>
        <li>
          <strong>Outside world link</strong>
          <span>
            This site is not only a cabinet. It is the public narrative and the public read path.
          </span>
        </li>
      </ul>

      <section className="card flat" style={{ marginTop: '1rem' }}>
        <h2>Two doors</h2>
        <div className="grid2">
          <div className="door">
            <h3>Public</h3>
            <p className="muted">
              About · system rules · explore a transaction. No key required.
            </p>
            <div className="actions">
              <Link href="/about">
                <button type="button" className="secondary">
                  About us
                </button>
              </Link>
              <Link href="/explore">
                <button type="button" className="primary">
                  Explore
                </button>
              </Link>
            </div>
          </div>
          <div className="door">
            <h3>Institution</h3>
            <p className="muted">
              Dashboard, tokenization wizard, claims, history. Allowlisted only.
            </p>
            <div className="actions">
              <Link href="/login">
                <button type="button" className="primary">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
