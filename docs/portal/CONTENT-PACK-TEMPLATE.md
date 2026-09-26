# Content pack template (copy this and fill)

Public page copy for the portal lives in **`portal/frontend/content-packs/<page>.<lang>.md`**
(inside the frontend Docker build context, so production can read it).
Blog posts live in **`portal/frontend/content-packs/blog/<slug>.<lang>.md`**.
Edit a pack, rebuild the portal — no code change is needed for copy.

| Route | Pack |
|-------|------|
| `/technologic/afc` | `technologic-afc` |
| `/technologic/ast` | `technologic-ast` |
| `/institutions` | `institutions` |
| `/investment` | `investment` |
| `/resources` | `resources` |
| `/resources/afc-docs` | `afc-docs` |
| `/resources/ast-docs` | `ast-docs` |
| `/resources/blog` | `blog` (+ posts in `blog/`) |
| `/whitepaper` | `whitepaper` |
| `/deep-dive` | `deep-dive` |
| `/docs` | `docs` |
| `/showcase` | `showcase-home` |
| `/contact` | `contact` |

A missing `<page>.<lang>.md` falls back to `<page>.en.md`.

## Rules

- One value per line (`key: value`). Values are plain text; inline `**bold**` and `[label](href)` are rendered. No HTML.
- Canon vocabulary applies: the canon gate rejects forbidden terms (see `.github/scripts/canon-gate.sh`).
- No legal absolutes, no performance numbers presented as measured unless they are, no token-sale language.

---

## Block: hero

```
eyebrow:
h1:
lead:
cta_primary_label:
cta_primary_href:
cta_secondary_label:
cta_secondary_href:
```

## Block: cards (repeat `id:` records; rendered as a grid)

```
id: card-1
tag:
title:
body:
button_label:
button_href:
```

## Block: section (repeat the block for each section)

```
id: section-id
title:
lead:
- A paragraph line.
* A bullet line (consecutive bullets form one list).
- Another paragraph.
callout: One highlighted line at the end of the section.
```

## Block: doors (calls to action at the bottom of the page)

```
id: door-1
title:
body:
button_label:
button_href:
```

## Blog post

```
title:
date: YYYY-MM-DD
summary:
author: Aros Studio
order: 1
tags: AFC, Settlement
---
Markdown body: ## and ### headings, paragraphs, - lists, > quotes, **bold**, [links](https://…).
```
