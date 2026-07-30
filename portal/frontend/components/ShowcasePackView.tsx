import Link from 'next/link';
import type { ContentPack } from '../lib/content-pack';

export function ShowcasePackView({ pack }: { pack: ContentPack }) {
  const h = pack.hero;
  return (
    <main className="wrap" style={{ maxWidth: 880, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <p className="muted" style={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
        {h.eyebrow ?? 'AST showcase'}
      </p>
      <h1 style={{ marginTop: '0.35rem', lineHeight: 1.2 }}>{h.h1 ?? pack.page}</h1>
      {h.lead && (
        <p style={{ fontSize: '1.1rem', maxWidth: 640, color: 'var(--muted, #a3a3a3)' }}>{h.lead}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '1.25rem 0 2rem' }}>
        {h.cta_primary_label && h.cta_primary_href && (
          <Link className="button primary" href={h.cta_primary_href}>
            {h.cta_primary_label}
          </Link>
        )}
        {h.cta_secondary_label && h.cta_secondary_href && (
          <Link className="button secondary" href={h.cta_secondary_href}>
            {h.cta_secondary_label}
          </Link>
        )}
      </div>

      {pack.cards.length > 0 && (
        <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {pack.cards.map((c) => (
            <article key={c.id} className="card flat" style={{ padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>{c.title}</h3>
              <p className="muted" style={{ marginBottom: c.button_href ? '0.75rem' : 0 }}>
                {c.body}
              </p>
              {c.button_label && c.button_href && (
                <Link href={c.button_href}>{c.button_label} →</Link>
              )}
            </article>
          ))}
        </section>
      )}

      {pack.sections.map((s) => (
        <section key={s.id} style={{ marginTop: '2rem' }}>
          {s.title && <h2>{s.title}</h2>}
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}

      {pack.doors.length > 0 && (
        <section style={{ marginTop: '2.5rem' }}>
          <h2>Doors</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pack.doors.map((d) => (
              <article key={d.id} className="card flat" style={{ padding: '1rem' }}>
                <h3 style={{ marginTop: 0 }}>{d.title}</h3>
                <p className="muted">{d.body}</p>
                {d.button_label && d.button_href && (
                  <Link className="button primary" href={d.button_href}>
                    {d.button_label}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="muted" style={{ marginTop: '3rem', fontSize: '0.85rem' }}>
        Content from pack <code>{pack.page}.{pack.language}.md</code> ·{' '}
        <Link href="/showcase">Showcase</Link> · <Link href="/">AST home</Link>
      </p>
    </main>
  );
}
