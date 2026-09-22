import Link from 'next/link';

/**
 * Home (Welcome). Full-bleed dark hero on the shared iridescent backdrop.
 * Navigation + footer come from the shared shell, not from this page.
 */
export default function HomePage() {
  return (
    <section className="home-hero">
      <div className="pad">
        <p className="page__eyebrow">Aros Studio · TECHNOlogic</p>
        <h1 className="home-hero__title">
          Lifecycle logic
          <br />
          for institutional assets.
        </h1>
        <p className="home-hero__lead">
          AST records valuations already confirmed by institutions. Digital units appear only after{' '}
          <strong>Proof of Transaction</strong>. <strong>NodeChain</strong> is the source of truth —
          this site is public lookup and the institution edge. It never mints.
        </p>
        <div className="home-hero__cta">
          <Link href="/technologic" className="btn-primary">
            Explore TECHNOlogic
          </Link>
          <Link href="/nodechain" className="btn-ghost">
            NodeChain journal <span aria-hidden="true">→</span>
          </Link>
          <Link href="/login" className="btn-ghost">
            Institution sign-in <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
