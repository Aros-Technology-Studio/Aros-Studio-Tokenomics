# Portal — frontend

**Path:** `portal/frontend/`  
**Stack:** Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, Zustand  
**Crypto helpers:** `portal/frontend/lib/crypto.ts`  
**API client:** `portal/frontend/lib/api.ts`

---

## Purpose

Minimal institutional UI for:

- Authentication (certificate / mTLS handshake UX)
- Starting tokenization with **institution-supplied** valuation
- Uploading signed documents
- Tracking process status
- Viewing **own** assets and history

The frontend is **not** a market terminal, appraisal tool, or admin mint console.

---

## Routes (v1)

| Area | Path | Role |
|------|------|------|
| Landing | `/` | Redirect / public minimal |
| Auth | `/(auth)/login` | Cert / mTLS handshake UX |
| Dashboard | `/(dashboard)` | Assets + tokens overview |
| Assets | `/(dashboard)/assets`, `.../[claimId]` | Tokenized assets (own only) |
| Tokenization | `/(dashboard)/tokenization`, `.../[processId]` | New process + status |
| History | `/(dashboard)/history` | NodeChain-derived events (scoped) |
| Profile | `/(dashboard)/profile` | Certificates |

**Partial release (later UI):** holder request under assets — still full Orchestrator process (`partial-release` pack). Not a phase toggle.

---

## UX rules

1. **Valuation fields are input, not computed by AST**  
   Labels and copy must state that the institution provides the official price. No “AST estimated value” widgets.

2. **No skip of PoT / NodeChain**  
   UI may only show status progression; it cannot offer “force complete” or “mint now.”

3. **КЭП required before document accept**  
   Local Web Crypto / КЭП integration verifies before or at upload; invalid signature → reject, process stays `documents_pending`.

4. **Own-data only**  
   Lists and detail pages request institution-scoped APIs; 404 for non-owned resources.

5. **Status is a projection**  
   Authoritative state is core + NodeChain; polling/stream of `GET /processes/{processId}` is convenience.

---

## Client state

| Concern | Approach |
|---------|----------|
| Session after login | Short-lived JWT from Portal API (session only; not node-edge auth) |
| Forms | Controlled inputs; valuation as decimal string |
| Process progress | Poll or future stream; map status enum to UI steps |
| Errors | Surface validation, 401/403, idempotency 409 |

---

## Status → UI mapping

| UI status | Meaning |
|-----------|---------|
| `created` | StartProcess done |
| `documents_pending` | Awaiting valid signed docs |
| `validating` | Document/signature validation |
| `pot_pending` | PoT evaluation |
| `settling` | Emission/settlement in flight |
| `completed` | EndProcess success |
| `failed` | Terminal fail (+ compensation if pre-verified) |
| `expired` | Timeout / oracle fail-closed |

---

## Forbidden frontend patterns

| Pattern | Why |
|---------|-----|
| Direct call to core mint/settle | Side door |
| Client-side price discovery presented as institutional valuation | Self-appraisal UX |
| Hiding signature requirement | Canon §5.2 |
| Showing other institutions’ processes | Scope violation |
| “Admin override verified” control | Canon violation |

---

## Accessibility and minimalism

Institutional operators need clarity over novelty: short flows, explicit errors, no speculative DeFi chrome (staking, farming, yield — forbidden product language).  
