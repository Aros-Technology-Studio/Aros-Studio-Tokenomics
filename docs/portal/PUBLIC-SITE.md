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
| `/about` | Aros Studio Tokenomics (AST) mission, positioning |
| `/system` | What AST can / cannot; principles; boundary vs bank/custodian |
| `/explore` | Public process lookup (no registration, no key) |
| `/nodechain` | Public NodeChain journal UI (tip, verify, height, process history) |
| `/login` | Institution only (cabinet entry) |
| `/dashboard`… | Cabinet (authenticated) |
| `/tokenization` | Wizard: document + e-sign → start process → certificate |

## Institutional digitization path (document-first)

The institution does **not** invent valuation up front. The signed document is the entry.

1. **Login** (`/login`) — allowlisted institution session  
2. **Upload first** — signed PDF / package (edge stores **hash only**)  
3. **Confirm e-signature** — `POST /v1/documents/verify-signature` (institutional attestation; full QES PKI follow-on)  
4. **Declare package fields** — values **as stated in the verified document** (not free appraisal)  
5. **Start process** — `POST /v1/tokenization/start` → Core hand-off (no mint on portal)  
6. **Certificate** — `GET /v1/processes/:id/certificate` — download/print digitization attestation

## Public NodeChain UI

| Path | Role |
|------|------|
| UI | `/nodechain` (Next.js) |
| Edge API | `/v1/public/nodechain/*` → Core `/v1/core/nodechain/*` |
| Nodes list | `GET /v1/public/nodechain/nodes` → Core `GET /v1/core/nodechain/nodes` |

**Read-only.** No append, no mint, no genesis POST from portal.  
Shows tip / chain integrity / **Nodes list** (height chain) / process-scoped journal rows.  

Not the network registry (`GET /v1/core/nodes` — writers/validators; not a public explorer table).  
See `docs/layers/01_NodeChain/08_api/nodes-vs-registry.md`.

## Public explorer rules (Canon)

- Input: `processId` (`AST-{INST}-{YYYYMMDD}-{suffix}`)
- Output: status, timestamps, valuation summary, PoT/source flags when known
- **No** secrets, tokens, private document bodies
- **No** write, mint, or NodeChain append from public API
- Missing process → 404, not leak of other institutions’ private notes beyond what edge stores for that id

## Visual bar

Public pages must feel like a **trustworthy institutional product site**, not a developer scaffold: clear hierarchy, calm palette, short plain language, no demo credentials on the home hero (demo only on login).
