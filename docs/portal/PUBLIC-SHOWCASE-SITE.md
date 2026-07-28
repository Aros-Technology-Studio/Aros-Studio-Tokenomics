# Public showcase site (“business card”) + AST portal

**Status:** Spec for build order  
**Date:** 2026-07-26  
**Languages:** Site UI copy will be provided by owner (EN / RU / KA as needed). Code and this doc: English.

## Split of surfaces

| Surface | Path / role | Audience |
|---------|-------------|----------|
| **Showcase site** | Marketing / trust entry (visiting card) | Anyone |
| **AST portal** | Operational system: explore, NodeChain, institution cabinet | Public read + allowlisted institutions |

The showcase is the **front door**. AST is the **working product**. Do not merge marketing essay into cabinet wizards.

```
Internet visitor
      │
      ▼
 Showcase site  ──link──►  AST portal (/explore, /nodechain, /login, …)
      │
      ├── White paper
      ├── Deep dive
      ├── Open-source docs
      └── About / contact (optional)
```

## Showcase IA (minimum)

| Route (proposed) | Content |
|------------------|---------|
| `/` or dedicated host path | Hero, what AST is (short), primary CTAs |
| `/whitepaper` | White paper (HTML or PDF + summary) |
| `/deep-dive` | Technical deep dive (architecture, PoT, NodeChain) |
| `/docs` | Links into open-source docs tree / GitHub / selected canon pages |
| `/ast` or CTA | Opens AST portal (local :3200 or public URL) |

Exact host (same domain vs subdomain vs `/showcase`) is decided when content + deploy path are fixed.

## AST portal home after content delivery

Owner supplies card/section copy in the **content pack** format below.  
Implementer maps each block into existing UI slots (hero, KPIs, feature list, CTAs) without inventing slogans.

## Content pack format (owner → implementer)

Deliver one file or message **per language** (or one file with three columns).  
Use this skeleton so placement is unambiguous.

```markdown
# Content pack — <page or section id>
Language: en | ru | ka
Page: home | about | system | showcase-home | whitepaper | deep-dive | docs

## Block: hero
eyebrow: …
h1: …
lead: …          # 1–3 short sentences, no slogans-as-poetry
cta_primary: …   # label
cta_primary_href: /explore | /login | external
cta_secondary: …
cta_secondary_href: …

## Block: card | kpi | feature | door
id: kpi-1
title: …
body: …
hint: …          # optional one line

## Block: section
id: …
title: …
paragraphs:
- …
bullets:
- …

## Assets (optional)
- whitepaper.pdf | path or URL
- diagram: …
```

**Rules for owner copy**

1. One idea per block; short sentences.  
2. No “crypto manifesto” tone (no “theater”, “costume”, “speculation war”).  
3. Product facts only: who, what, how to verify, what we refuse.  
4. Mark **must-link** URLs explicitly.  
5. If a block is empty, write `TBD` — do not invent text on implementer side.

## Build order

1. Owner delivers content packs (showcase + AST home first).  
2. Implementer wires showcase routes + links to AST.  
3. Replace AST home / remaining public pages block-by-block.  
4. White paper / deep dive / docs pages from delivered materials.  
5. i18n EN/RU/KA for all delivered languages.

## Out of scope until content exists

- Inventing white paper body  
- Inventing deep-dive technical essay beyond linking existing `docs/`  
- Permanent domain hosting (separate ops track)

## Link targets already available in AST

| Label | Path |
|-------|------|
| Process lookup | `/explore` |
| Journal | `/nodechain` |
| System bounds | `/system` |
| About | `/about` |
| Institution login | `/login` |
| Canon (repo) | `docs/AST-CORE-CANON.md` |
| Pilot status | `docs/portal/PILOT-STATUS-FOR-REVIEW.md` |
