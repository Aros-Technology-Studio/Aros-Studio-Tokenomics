/**
 * D9/D10 — parse simple owner content packs (markdown-ish) for public pages.
 *
 * Packs live in `portal/frontend/content-packs/<page>.<lang>.md` so they are
 * inside the frontend Docker build context (the prod image is built from
 * `portal/frontend`). The legacy `fixtures/content-packs` roots are still
 * searched for local runs from the repository root.
 *
 * Pack format (one file per page and language):
 *
 *   ## Block: hero      — eyebrow, h1, lead, cta_primary_label/href, cta_secondary_label/href
 *   ## Block: cards     — repeated `id:` records: title, body, tag, button_label, button_href
 *   ## Block: section   — id, title, lead, callout; `- ` lines = paragraphs, `* ` lines = bullets
 *   ## Block: doors     — repeated `id:` records (same keys as cards), rendered as calls to action
 *
 * Values are single-line plain text. Inline `**bold**` and `[label](href)` are
 * rendered by the page component; no raw HTML is ever interpreted.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export type PackHero = {
  eyebrow?: string;
  h1?: string;
  lead?: string;
  cta_primary_label?: string;
  cta_primary_href?: string;
  cta_secondary_label?: string;
  cta_secondary_href?: string;
};

export type PackCard = {
  id: string;
  title?: string;
  body?: string;
  tag?: string;
  button_label?: string;
  button_href?: string;
};

export type PackSection = {
  id: string;
  title?: string;
  lead?: string;
  callout?: string;
  paragraphs: string[];
  bullets: string[];
  /** Paragraphs and bullets in file order (consecutive bullets form one list). */
  flow: { kind: 'p' | 'li'; text: string }[];
};

export type PackBlock =
  | { kind: 'cards'; cards: PackCard[] }
  | { kind: 'section'; section: PackSection };

export type ContentPack = {
  page: string;
  language: string;
  found: boolean;
  hero: PackHero;
  /** All cards blocks flattened (kept for backwards compatibility). */
  cards: PackCard[];
  /** All section blocks flattened (kept for backwards compatibility). */
  sections: PackSection[];
  /** Cards and sections in the order they appear in the file. */
  blocks: PackBlock[];
  doors: PackCard[];
};

export function packRoots(): string[] {
  return [
    path.join(process.cwd(), 'content-packs'),
    path.join(process.cwd(), 'portal/frontend/content-packs'),
    path.join(process.cwd(), 'fixtures/content-packs'),
    path.join(process.cwd(), '../../fixtures/content-packs'),
    path.join(process.cwd(), '../fixtures/content-packs'),
  ];
}

export function readPackFile(relative: string): string | null {
  for (const root of packRoots()) {
    const p = path.join(root, relative);
    if (existsSync(p)) {
      return readFileSync(p, 'utf8');
    }
  }
  return null;
}

export function loadContentPack(pageId: string, lang = 'en'): ContentPack {
  const raw = readPackFile(`${pageId}.${lang}.md`) ?? (lang !== 'en' ? readPackFile(`${pageId}.en.md`) : null);
  if (!raw) {
    return emptyPack(pageId, lang);
  }
  return parseContentPack(raw, pageId, lang);
}

export function emptyPack(pageId: string, lang: string): ContentPack {
  return {
    page: pageId,
    language: lang,
    found: false,
    hero: {
      h1: pageId,
      lead: 'Content pack not found — add portal/frontend/content-packs/' + pageId + '.' + lang + '.md',
    },
    cards: [],
    sections: [],
    blocks: [],
    doors: [],
  };
}

export function parseContentPack(raw: string, pageId: string, lang: string): ContentPack {
  const pack: ContentPack = {
    page: pageId,
    language: lang,
    found: true,
    hero: {},
    cards: [],
    sections: [],
    blocks: [],
    doors: [],
  };

  const blocks = raw.split(/^## Block:\s*/im).slice(1);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    const kindLine = (lines[0] ?? '').trim().toLowerCase();
    const body = lines.slice(1).join('\n');

    if (kindLine.startsWith('hero')) {
      pack.hero = parseKv(body);
      continue;
    }

    if (kindLine.startsWith('cards') || kindLine.startsWith('card')) {
      const cards = parseRepeatedCards(body);
      pack.cards.push(...cards);
      pack.blocks.push({ kind: 'cards', cards });
      continue;
    }

    if (kindLine.startsWith('doors') || kindLine.startsWith('door')) {
      pack.doors.push(...parseRepeatedCards(body));
      continue;
    }

    if (kindLine.startsWith('section')) {
      const kv = parseKv(body);
      // `- ` lines are paragraphs, `* ` lines are bullet items. Each line is read once, in order.
      const flow: PackSection['flow'] = [];
      for (const m of body.matchAll(/^([-*]) (.+)$/gm)) {
        flow.push({ kind: m[1] === '-' ? 'p' : 'li', text: m[2].trim() });
      }
      const paragraphs = flow.filter((f) => f.kind === 'p').map((f) => f.text);
      const bullets = flow.filter((f) => f.kind === 'li').map((f) => f.text);
      const section: PackSection = {
        id: kv.id ?? `section-${pack.sections.length + 1}`,
        title: kv.title,
        lead: kv.lead,
        callout: kv.callout,
        paragraphs: paragraphs.length ? paragraphs : kv.body ? [kv.body] : [],
        bullets,
        flow: flow.length ? flow : kv.body ? [{ kind: 'p', text: kv.body }] : [],
      };
      pack.sections.push(section);
      pack.blocks.push({ kind: 'section', section });
    }
  }

  return pack;
}

export function parseKv(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^([a-z0-9_]+):\s*(.*)$/i);
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

function parseRepeatedCards(body: string): PackCard[] {
  const cards: PackCard[] = [];
  const chunks = body.split(/^id:\s*/im).filter((c) => c.trim().length > 0);
  for (const chunk of chunks) {
    const kv = parseKv('id: ' + chunk);
    if (!kv.id && !kv.title) continue;
    cards.push({
      id: kv.id ?? `card-${cards.length + 1}`,
      title: kv.title,
      body: kv.body,
      tag: kv.tag,
      button_label: kv.button_label,
      button_href: kv.button_href,
    });
  }
  return cards;
}
