import { ProcessSubmitForm } from './process-submit-form';

export default function HomePage() {
  return (
    <>
      <h1>Primary tokenization submission</h1>
      <p className="lead">
        Institutional edge only. Requires <strong>official valuation</strong> (decimal string) and{' '}
        <strong>qualified signature</strong> evidence. Portal does not mint — Core Orchestrator /
        PoT remain the economic path. <code>processId</code> follows{' '}
        <code>AST-{'{INST}'}-{'{YYYYMMDD}'}-{'{suffix}'}</code>; <code>Idempotency-Key</code> is
        mandatory.
      </p>
      <ProcessSubmitForm />
    </>
  );
}
