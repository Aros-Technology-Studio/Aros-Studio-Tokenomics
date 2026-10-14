import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Safe inline renderer for owner-written copy: supports **bold** and
 * [label](href). Everything else is rendered as text — no HTML is parsed.
 */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={i++}>{m[1]}</strong>);
    } else {
      const href = m[3];
      const label = m[2];
      if (href.startsWith('/')) {
        out.push(
          <Link key={i++} href={href}>
            {label}
          </Link>,
        );
      } else if (/^(https?:|mailto:)/.test(href)) {
        out.push(
          <a key={i++} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
            {label}
          </a>,
        );
      } else {
        out.push(label);
      }
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** Minimal block markdown for blog posts: headings, paragraphs, lists, quotes. */
export function Prose({ source }: { source: string }) {
  const lines = source.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];
  let k = 0;

  const flush = () => {
    if (para.length) {
      blocks.push(
        <p key={k++}>
          <Inline text={para.join(' ')} />
        </p>,
      );
      para = [];
    }
    if (list.length) {
      blocks.push(
        <ul key={k++}>
          {list.map((item, j) => (
            <li key={j}>
              <Inline text={item} />
            </li>
          ))}
        </ul>,
      );
      list = [];
    }
    if (quote.length) {
      blocks.push(
        <blockquote key={k++}>
          <Inline text={quote.join(' ')} />
        </blockquote>,
      );
      quote = [];
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    const h3 = t.match(/^###\s+(.+)$/);
    const h2 = t.match(/^##\s+(.+)$/);
    const li = t.match(/^[-*]\s+(.+)$/);
    const q = t.match(/^>\s?(.*)$/);
    if (h3 || h2) {
      flush();
      blocks.push(
        h3 ? (
          <h3 key={k++}>
            <Inline text={h3[1]} />
          </h3>
        ) : (
          <h2 key={k++}>
            <Inline text={h2![1]} />
          </h2>
        ),
      );
    } else if (li) {
      if (para.length || quote.length) flush();
      list.push(li[1]);
    } else if (q) {
      if (para.length || list.length) flush();
      quote.push(q[1]);
    } else {
      if (list.length || quote.length) flush();
      para.push(t);
    }
  }
  flush();
  return <div className="prose">{blocks}</div>;
}
