# Institutional Intake (Issuer path)

**Status:** Canonical process surface (v1)  
**Canon:** Core Canon §V RWA tokenization; orchestrator sole economic entry  
**Portal:** `portal/` (edge)  
**Core:** `src/orchestrator/`, `src/core-api/`

---

## 1. Purpose

Mandatory **single entry** for institutions to submit a document package, qualified electronic signature (КЭП), and start a tokenization (or related) process. AST does **not** appraise assets — intake accepts only **already confirmed institutional valuation**.

---

## 2. Actors

| Actor | Role |
|-------|------|
| Institution (issuer) | Submits package + КЭП via Portal |
| Portal edge | Validates signature presence/format; forwards to core |
| Orchestrator | Sole economic process entry |
| PoT / NodeChain | Confirmation and ledger truth |
| Oracle gateway | Optional multi-oracle step if process type requires |

---

## 3. Intake steps

1. **Authenticate institution** (allowlist / cert — nodes/portal policy).  
2. **Upload documents** with **mandatory КЭП** (`POST /documents/upload` on portal edge).  
3. **Reject** if signature missing (`qualified_signature_required`).  
4. **StartProcess** via core Orchestrator with `processId` + `idempotencyKey`.  
5. Pipeline: Docs → Oracle? → PoT → NodeChain → Emission → Settlement → State → End.  
6. Registry-number binding (when provided by institution) recorded in process payload / NodeChain — not invented by AST.

---

## 4. Signature verification

| Rule | Behavior |
|------|----------|
| КЭП required on document upload | Fail closed without signature |
| Verification | Portal edge validates; orchestrator document step enforces package rules |
| Human-free path | Policy-driven automation allowed; optional human approval by process policy only |
| Fail closed | Invalid package → no PoT success path |

Implementation notes: `portal/backend/src/modules/documents/documents.controller.ts`, `docs/modules/portal/digital-signature.md`.

---

## 5. Registry-number binding

- Institution may supply external registry identifiers.  
- AST binds them to `processId` / NodeChain records for audit.  
- AST is not the traditional land registry; traditional registry receives a mark that the asset is tokenized (canon §5.3).

---

## 6. Non-goals

- AST self-appraisal of asset price  
- Free mint without PoT  
- Bypassing Orchestrator for economic effects  
- Eye veto of intake  

---

## 7. Related

- Process: `docs/processes/primary-tokenization.md`  
- Portal modules: `docs/modules/portal/`  
- Architecture: `docs/architecture/INSTITUTIONAL_PORTAL.md`  
