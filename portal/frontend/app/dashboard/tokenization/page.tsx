export default function TokenizationPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 720 }}>
      <h1>New tokenization</h1>
      <p>
        Provide <strong>institutional valuation</strong> (required). AST does
        not calculate asset prices. Documents require a qualified e-signature
        (КЭП).
      </p>
      <ol>
        <li>Fill asset type, valuation, currency, idempotency key</li>
        <li>
          <code>POST /v1/tokenization/start</code> → processId
        </li>
        <li>Upload signed documents</li>
        <li>Track process status until completed</li>
      </ol>
      <p style={{ color: '#666' }}>Form UI: scaffold — wire to Portal API next.</p>
    </main>
  );
}
