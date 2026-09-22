import Link from 'next/link';
import type { Metadata } from 'next';
import { Reveal } from '../../components/ui/reveal';

export const metadata: Metadata = { title: 'Institutions' };

const STEPS = [
  'Apply for <b>admission</b> — valid institutional certificate, checked against the allowlist.',
  'Open a <b>process</b> for the work already confirmed on your side.',
  'The process passes <b>Proof of Transaction</b> — all four criteria, or none.',
  'The confirmed state is <b>recorded in NodeChain</b>, append-only.',
  'Your institution <b>reads it back</b> — public lookup, or the institution edge.',
];

export default function InstitutionsPage() {
  return (
    <section className="page">
      <div className="pad">
        <Reveal as="div" className="page__eyebrow">
          For institutions
        </Reveal>
        <Reveal as="div" delay={1}>
          <h1 className="page__title">Institutions</h1>
        </Reveal>
        <Reveal as="div" delay={2}>
          <p className="page__lead">
            AST admits <strong>allowlisted institutions</strong> to open processes for work they
            have already confirmed. The portal never mints and never appraises — it only records
            what passed the gate, and lets you read it back.
          </p>
        </Reveal>

        <Reveal as="div" delay={1} className="tl-grid">
          <div className="tl-card glass">
            <span className="tl-card__id">01</span>
            <h3>Allowlisted admission</h3>
            <p>Access is scoped to institutions with a valid certificate on the allowlist — no open sign-up.</p>
          </div>
          <div className="tl-card glass">
            <span className="tl-card__id">02</span>
            <h3>No custody, no mint</h3>
            <p>The institution edge submits and reads. Core remains the source of truth after hand-off.</p>
          </div>
        </Reveal>

        <div className="plist">
          {STEPS.map((s, i) => (
            <Reveal as="div" key={s} className="pitem">
              <div className="pnum">0{i + 1}</div>
              <div className="ptext" dangerouslySetInnerHTML={{ __html: s }} />
            </Reveal>
          ))}
        </div>

        <Reveal as="div" delay={1} className="home-hero__cta" style={{ marginTop: 56 }}>
          <Link href="/login" className="btn-primary">
            Institution sign-in
          </Link>
          <Link href="/nodechain" className="btn-ghost">
            Look up NodeChain <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
