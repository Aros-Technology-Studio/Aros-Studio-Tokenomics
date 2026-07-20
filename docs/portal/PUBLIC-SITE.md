# Portal = public face + institutional cabinet

**Status:** Product intent (v1.1)  
**Audience:** Outside world **and** allowlisted institutions  

## Dual role

| Surface | Who | Auth | Purpose |
|---------|-----|------|---------|
| **Public site** | Anyone | None | Who we are, what AST is, can/cannot, trust story |
| **Public explorer** | Anyone | None | Look up a process/transaction by `processId` (read-only) |
| **Institution cabinet** | Allowlisted institutions | Session / later JWT+mTLS | Submit packages, dashboard, claims, history |

Portal is the **connection to the outside world**.  
NodeChain remains SoT; public explorer is **read path only** — no mint, no journal write, no Eye veto.

## Public information architecture

| Path | Content |
|------|---------|
| `/` | Landing — value prop, CTAs: Explore · About · Institution login |
| `/about` | Aros Financial Core / AST mission, positioning |
| `/system` | What AST can / cannot; principles; boundary vs bank/custodian |
| `/explore` | Public process lookup (no registration, no key) |
| `/login` | Institution only (cabinet entry) |
| `/dashboard`… | Cabinet (authenticated) |

## Public explorer rules (Canon)

- Input: `processId` (`AST-{INST}-{YYYYMMDD}-{suffix}`)
- Output: status, timestamps, valuation summary, PoT/source flags when known
- **No** secrets, tokens, private document bodies
- **No** write, mint, or NodeChain append from public API
- Missing process → 404, not leak of other institutions’ private notes beyond what edge stores for that id

## Visual bar

Public pages must feel like a **trustworthy institutional product site**, not a developer scaffold: clear hierarchy, calm palette, short plain language, no demo credentials on the home hero (demo only on login).
