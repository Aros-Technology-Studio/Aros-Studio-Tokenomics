import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ContentPack, PackCard, PackSection } from '../../lib/content-pack';
import { Inline } from './rich-text';

function CtaLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  const cls = primary ? 'btn-primary' : 'btn-ghost';
  if (/^(https?:|mailto:)/.test(href)) {
    return (
      <a className={cls} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
        {label} {primary ? null : '→'}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {label} {primary ? null : '→'}
    </Link>
  );
}

function Card({ card }: { card: PackCard }) {
  return (
    <article className="pack-card glass">
      {card.tag ? <span className="pack-card__tag">{card.tag}</span> : null}
      {card.title ? <h3>{card.title}</h3> : null}
      {card.body ? (
        <p>
          <Inline text={card.body} />
        </p>
      ) : null}
      {card.button_label && card.button_href ? (
        <span className="pack-card__go">
          <CtaLink href={card.button_href} label={card.button_label} />
        </span>
      ) : null}
    </article>
  );
}

function groupFlow(flow: PackSection['flow']): { kind: 'p' | 'li'; items: string[] }[] {
  const out: { kind: 'p' | 'li'; items: string[] }[] = [];
  for (const f of flow) {
    const last = out[out.length - 1];
    if (f.kind === 'li' && last && last.kind === 'li') last.items.push(f.text);
    else out.push({ kind: f.kind, items: [f.text] });
  }
  return out;
}

function Section({ section }: { section: PackSection }) {
  return (
    <section className="pack-section glass" id={section.id}>
      {section.title ? <h2>{section.title}</h2> : null}
      {section.lead ? (
        <p className="pack-section__lead">
          <Inline text={section.lead} />
        </p>
      ) : null}
      {groupFlow(section.flow).map((g, i) =>
        g.kind === 'p' ? (
          <p key={i}>
            <Inline text={g.items[0]} />
          </p>
        ) : (
          <ul key={i} className="pack-list">
            {g.items.map((b, j) => (
              <li key={j}>
                <Inline text={b} />
              </li>
            ))}
          </ul>
        ),
      )}
      {section.callout ? (
        <p className="pack-callout">
          <Inline text={section.callout} />
        </p>
      ) : null}
    </section>
  );
}

/**
 * Public page rendered from a content pack, in the shared dark "glass" style.
 * `children` renders after the pack blocks (e.g. a blog index).
 */
export function PackPage({ pack, children }: { pack: ContentPack; children?: ReactNode }) {
  const h = pack.hero;
  return (
    <section className="page">
      <div className="pad">
        {h.eyebrow ? <p className="page__eyebrow">{h.eyebrow}</p> : null}
        <h1 className="page__title">{h.h1 ?? pack.page}</h1>
        {h.lead ? (
          <p className="page__lead">
            <Inline text={h.lead} />
          </p>
        ) : null}
        {(h.cta_primary_label && h.cta_primary_href) || (h.cta_secondary_label && h.cta_secondary_href) ? (
          <div className="pack-ctas">
            {h.cta_primary_label && h.cta_primary_href ? (
              <CtaLink href={h.cta_primary_href} label={h.cta_primary_label} primary />
            ) : null}
            {h.cta_secondary_label && h.cta_secondary_href ? (
              <CtaLink href={h.cta_secondary_href} label={h.cta_secondary_label} />
            ) : null}
          </div>
        ) : null}

        <div className="pack-body">
          {pack.blocks.map((b, i) =>
            b.kind === 'cards' ? (
              <div key={i} className="pack-grid" data-count={Math.min(b.cards.length, 6)}>
                {b.cards.map((c) => (
                  <Card key={c.id} card={c} />
                ))}
              </div>
            ) : (
              <Section key={i} section={b.section} />
            ),
          )}

          {children}

          {pack.doors.length ? (
            <div className="pack-doors">
              {pack.doors.map((d) => (
                <div key={d.id} className="pack-door glass">
                  <div>
                    {d.title ? <h3>{d.title}</h3> : null}
                    {d.body ? (
                      <p>
                        <Inline text={d.body} />
                      </p>
                    ) : null}
                  </div>
                  {d.button_label && d.button_href ? (
                    <CtaLink href={d.button_href} label={d.button_label} primary />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
