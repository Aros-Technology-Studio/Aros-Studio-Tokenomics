/**
 * Blog posts for /resources/blog — plain markdown files under
 * `content-packs/blog/<slug>.<lang>.md`.
 *
 * File layout:
 *
 *   title: Post title
 *   date: 2026-09-26
 *   summary: One-sentence summary shown on the index.
 *   author: Aros Studio
 *   tags: AFC, Settlement
 *   ---
 *   Markdown body (## / ### headings, paragraphs, `- ` lists, `> ` quotes,
 *   **bold**, [links](https://…)). No raw HTML is interpreted.
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { packRoots } from './content-pack';

export type BlogPost = {
  slug: string;
  language: string;
  title: string;
  date: string;
  summary: string;
  author: string;
  tags: string[];
  body: string;
  /** Optional manual ordering among posts with the same date (lower first). */
  order?: string;
};

function blogDirs(): string[] {
  return packRoots().map((root) => path.join(root, 'blog'));
}

function parsePost(raw: string, slug: string, language: string): BlogPost {
  const split = raw.split(/^---\s*$/m);
  const head = split[0] ?? '';
  const body = split.slice(1).join('---').trim();
  const meta: Record<string, string> = {};
  for (const line of head.split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
  }
  return {
    slug,
    language,
    title: meta.title ?? slug,
    date: meta.date ?? '',
    summary: meta.summary ?? '',
    author: meta.author ?? 'Aros Studio',
    tags: (meta.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    body,
    order: meta.order,
  };
}

export function listPosts(lang = 'en'): BlogPost[] {
  const seen = new Map<string, BlogPost>();
  for (const dir of blogDirs()) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      const m = file.match(/^(.+)\.([a-z]{2})\.md$/);
      if (!m || m[2] !== lang || seen.has(m[1])) continue;
      seen.set(m[1], parsePost(readFileSync(path.join(dir, file), 'utf8'), m[1], m[2]));
    }
  }
  const order = (p: BlogPost) => Number(p.order ?? 0);
  return [...seen.values()].sort((a, b) =>
    a.date !== b.date ? (a.date < b.date ? 1 : -1) : order(a) - order(b),
  );
}

export function getPost(slug: string, lang = 'en'): BlogPost | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  for (const dir of blogDirs()) {
    const p = path.join(dir, `${slug}.${lang}.md`);
    if (existsSync(p)) return parsePost(readFileSync(p, 'utf8'), slug, lang);
  }
  return null;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
