import Link from 'next/link';
import type { ReactNode } from 'react';
import { T } from './t';

export interface StubLink {
  label: string;
  href: string;
}

/**
 * Shared placeholder page for skeleton routes.
 * Renders on the global dark backdrop with the shared nav/footer from the shell.
 */
export function StubPage({
  eyebrow,
  title,
  lead,
  note = 'Placeholder — content to be filled in.',
  links,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  note?: string;
  links?: StubLink[];
  children?: ReactNode;
}) {
  return (
    <section className="page">
      <div className="pad">
        <p className="page__eyebrow"><T>{eyebrow}</T></p>
        <h1 className="page__title">{title}</h1>
        <p className="page__lead"><T>{lead}</T></p>

        <div className="stub glass">
          <span className="stub__tag"><T>In progress</T></span>
          <h3>Section skeleton</h3>
          <p><T>{note}</T></p>
          {links && links.length > 0 ? (
            <div className="stub__links">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {children}
      </div>
    </section>
  );
}
