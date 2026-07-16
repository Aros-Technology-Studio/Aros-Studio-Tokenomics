# Common — Crypto

**Code:** `src/common/crypto` (`hash.ts` and related)  
**Consumers:** nodes, pot, nodechain, state-recording  
**Decisions:** P2–P3 common — hash/signature verification primitives  

---

## Purpose

Provide **low-level** cryptographic helpers: content hashing, signature verification utilities, and shared constants used to link ExecutionSnapshots and validator confirmations.

Common crypto is **not**:

- A KMS or HSM product  
- Node certificate lifecycle (nodes module)  
- PoT quorum policy  
- Encryption key governance for multi-tenant secrets (config/secrets)

---

## Typical primitives

| Primitive | Use |
|-----------|-----|
| Content hash (e.g. SHA-256 family as implemented) | ExecutionSnapshot.hash, record contentHash |
| Canonical serialization helper | Deterministic hashing inputs |
| Signature verify | Validator / institutional qualified signatures at the edge of pot/nodes |
| Constant-time compare | Avoid naive string equality on secrets/hashes where relevant |

Exact algorithms are implementation-defined in code but must remain **deterministic** for I4 replay.

---

## Relation to NodeChain encryption

- **At-rest encryption** of sensitive payloads is implemented in nodechain (`sensitive-payload`) using keys from config.  
- Common may supply building blocks (AES-GCM helpers, etc.) if present; **policy** of what is sensitive is domain-owned.  
- Redaction of history is forbidden; crypto enables confidentiality at rest, not erasure.

---

## Relation to PoT signatures

| Layer | Responsibility |
|-------|----------------|
| common/crypto | verify helper, hash helper |
| nodes | certs, keys, mTLS, allowlist |
| pot | which signatures count for M-of-N |
| nodechain | store evidence hashes immutably |

Common must not “auto-verify and set verified=1.”

---

## Security boundaries

| Rule | Rationale |
|------|-----------|
| No private keys hard-coded in common | Secrets in env/KMS |
| No admin mint signing helper | Free mint path |
| No Eye “override signature” | Forbidden power |
| Prefer vetted Node crypto APIs | Supply-chain hygiene |

---

## Testing

- Hash stability golden vectors for fixed payloads.  
- Verify rejects malformed signatures.  
- Domain tests (pot) cover quorum counting; common tests cover primitive correctness only.

---

## Export

Re-export crypto helpers only through the **common barrel**. Domain modules should not depend on deep private paths as public API.

---

## Non-goals

- Implementing full BFT or threshold crypto for v1 (BFT later; PoT+quorum enough)  
- Cross-chain bridge light clients  
- Browser wallet UX  
