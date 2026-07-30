# D9 · D10 — Showcase routes + content packs

**Status:** Scaffold + demo EN packs  
**Spec base:** `PUBLIC-SHOWCASE-SITE.md` · `CONTENT-PACK-TEMPLATE.md`

---

## D9 — Routes (portal frontend)

| Route | Pack id |
|-------|---------|
| `/showcase` | `showcase-home` |
| `/whitepaper` | `whitepaper` |
| `/deep-dive` | `deep-dive` |
| `/docs` | `docs` |

Loader: `portal/frontend/lib/content-pack.ts`  
View: `portal/frontend/components/ShowcasePackView.tsx`

Showcase is the **front door**. AST cabinet stays under `/login`, `/tokenization`, etc.

---

## D10 — Content packs

Location: `fixtures/content-packs/<page>.<lang>.md`

Demo packs shipped (English):

- `showcase-home.en.md`
- `whitepaper.en.md`
- `deep-dive.en.md`
- `docs.en.md`

Owner replaces copy via packs without rewriting layout components.  
RU/KA: add `*.ru.md` / `*.ka.md` and pass lang when i18n wires showcase (residual).

---

## Acceptance

| Check | Evidence |
|-------|----------|
| Routes resolve | Next app routes under `app/showcase` etc. |
| Packs parse | loadContentPack finds fixtures |
| Template for owner | `CONTENT-PACK-TEMPLATE.md` |
| Residual owner copy | Owner may rewrite EN / add RU/KA |

## Residual

- Full multi-language switcher on showcase  
- CMS / admin UI for packs  
- Separate marketing host (optional ops)  
