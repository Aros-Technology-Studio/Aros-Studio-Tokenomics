/**
 * D9/D10 — parse simple owner content packs (markdown-ish) for showcase pages.
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
  button_label?: string;
  button_href?: string;
};

export type PackSection = {
  id: string;
  title?: string;
  paragraphs: string[];
};

export type ContentPack = {
  page: string;
  language: string;
  hero: PackHero;
  cards: PackCard[];
  sections: PackSection[];
  doors: PackCard[];
};

function packRoots(): string[] {
  return [
    path.join(process.cwd(), 'fixtures/content-packs'),
    path.join(process.cwd(), '../../fixtures/content-packs'),
    path.join(process.cwd(), '../fixtures/content-packs'),
  ];
}

export function loadContentPack(pageId: string, lang = 'en'): ContentPack {
  const fileName = `${pageId}.${lang}.md`;
  let raw = '';
  for (const root of packRoots()) {
    const p = path.join(root, fileName);
    if (existsSync(p)) {
      raw = readFileSync(p, 'utf8');
      break;
    }
  }
  if (!raw) {
    return emptyPack(pageId, lang);
  }
  return parseContentPack(raw, pageId, lang);
}

export function emptyPack(pageId: string, lang: string): ContentPack {
  return {
    page: pageId,
    language: lang,
    hero: {
      h1: pageId,
      lead: 'Content pack not found — add fixtures/content-packs/' + pageId + '.' + lang + '.md',
    },
    cards: [],
    sections: [],
    doors: [],
  };
}

export function parseContentPack(raw: string, pageId: string, lang: string): ContentPack {
  const pack: ContentPack = {
    page: pageId,
    language: lang,
    hero: {},
    cards: [],
    sections: [],
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
      pack.cards.push(...parseRepeatedCards(body));
      continue;
    }

    if (kindLine.startsWith('doors') || kindLine.startsWith('door')) {
      pack.doors.push(...parseRepeatedCards(body));
      continue;
    }

    if (kindLine.startsWith('section')) {
      const kv = parseKv(body);
      const paragraphs = [...body.matchAll(/^- (.+)$/gm)].map((m) => m[1]);
      // also paragraphs: list style from template
      const paraBlock = body.match(/paragraphs:\s*\n((?:- .+\n?)+)/i);
      if (paraBlock) {
        for (const m of paraBlock[1].matchAll(/^- (.+)$/gm)) paragraphs.push(m[1]);
      }
      pack.sections.push({
        id: kv.id ?? `section-${pack.sections.length + 1}`,
        title: kv.title,
        paragraphs: paragraphs.length
          ? paragraphs
          : kv.body
            ? [kv.body]
            : [],
      });
    }
  }

  return pack;
}

function parseKv(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^([a-z0-9_]+):\s*(.*)$/i);
    if (m) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

function parseRepeatedCards(body: string): PackCard[] {
  const cards: PackCard[] = [];
  const chunks = body.split(/^id:\s*/im).filter(Boolean);
  for (const chunk of chunks) {
    const lines = ('id: ' + chunk).split(/\r?\n/);
    const kv = parseKv(lines.join('\n'));
    if (!kv.id && !kv.title) continue;
    cards.push({
      id: kv.id ?? `card-${cards.length + 1}`,
      title: kv.title,
      body: kv.body,
      button_label: kv.button_label,
      button_href: kv.button_href,
    });
  }
  return cards;
}
