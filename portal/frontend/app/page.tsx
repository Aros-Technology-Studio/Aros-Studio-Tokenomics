export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 640 }}>
      <h1>AST Institutional Portal</h1>
      <p>
        Edge UI for institutions. Economic cycles run through core Orchestrator
        (PoT → NodeChain → Emission). AST does not appraise assets.
      </p>
      <ul>
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li>
          <a href="/dashboard/tokenization">New tokenization</a>
        </li>
      </ul>
    </main>
  );
}
