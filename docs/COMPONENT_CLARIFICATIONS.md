# Component Clarifications (owner questionnaire)

**Status:** P0 answers **canonical for v1** (owner, based on AST Core Canon v1.0 Final, 16 July 2026)  
**Purpose:** Capture exact product intent per component before PURPOSE/MODEL/CONTRACT/ACCEPTANCE packs and code.  
**Language:** English in repo; product owner may answer in Russian in chat — answers are translated here.  
**Principle:** [ANTI_POLICE.md](./principles/ANTI_POLICE.md)  
**Canon:** `/CANON.md`

How to use:

1. Answer **P0 first** (blocks everything else).  
2. Then P1 → P2 → P3.  
3. After answers land, each component gets a four-file pack.  
4. Changes to these answers require formal canon amendment.

---

# P0 — CANONICAL ANSWERS (v1)

## 1. `invariants`

1. Is the invariant list complete for v1?  
   `A:` **Complete for v1** as in `CANON.md` §XI (I1–I9). New invariants only via formal canon update (semver + governance).

2. Pure predicates only, or also guards on every write-path?  
   `A:` **Both.** Pure checks + hard guards on every write-path (fail-closed).

3. Who evaluates?  
   `A:` **Any component before side-effect** (mandatory). The All-Seeing Eye monitors additionally (no veto).

4. On violation?  
   `A:` **Fail closed** + record in NodeChain. Eye has **no** veto/rollback.

5. Versioning?  
   `A:` Versioned: `I-ID-vX.Y` + semver. Set frozen until canon change.

6. CI tests?  
   `A:` **Every invariant → automated CI test** (mandatory).

7. Critical vs non-critical?  
   `A:` **All critical.** Non-critical not allowed in v1.

8. Supply conservation (born/burned)?  
   `A:` **Online hard gate** (fail closed) + offline reconciliation as extra control.

9. Legal / selective custody?  
   `A:` **Machine rules** (hard-coded + policy-as-code). Technical economics secondary.

10. API shape?  
    `A:` `assertInvariant` (write-path) + `checkAll` (periodic) + event `InvariantBroken` (for Eye and audit).

---

## 2. `pot` (Proof-of-Transaction)

1. Minimum evidence of execution?  
   `A:` `processId`, ExecutionSnapshot (hash + prevHash), validatorId(s), digital signatures (qualified e-signature), `criteriaResult` (all conditions P1–P4).

2. Confirmation quorum?  
   `A:` **M-of-N** (configurable; default **2/3** of assigned validators).

3. Verdict shape?  
   `A:` **Binary** `verified = 0 | 1` + orchestration statuses (`pending`, `expired`).

4. Revoke after verified?  
   `A:` **Final.** Immutable; revoke impossible.

5. Timeout?  
   `A:` Process → `expired` → fail closed. Retry only with a **new** `processId`.

6. Scope beyond work confirmation?  
   `A:` Work confirmation + **processId uniqueness** + ordering via `ledgerHeight`.

7. Who submits confirmation?  
   `A:` **Quorum validators** (executor prepares; orchestrator coordinates only).

8. NodeChain before emission?  
   `A:` **Yes, mandatory** (strictly before emission).

9. Does pot compute amount?  
   `A:` **No.** Only “ok → emission”. Amount from Emission Engine (institutional valuation + ΔValue).

10. Double confirmation same process?  
    `A:` **Error** + record for The All-Seeing Eye.

---

## 3. `reserve`

1. Asset types v1?  
   `A:` **Multi** (fiat + crypto + institutional claims).

2. Where does reserve sit?  
   `A:` **AST books only** (selective custody — own funds). External Anchor later.

3. 1:1 meaning?  
   `A:` **Both** asset units and arx + **snapshot rate** at PoT time.

4. Bag vs one-to-one claim?  
   `A:` **One bag, many claims** with precise accounting.

5. Who locks before mint?  
   `A:` **Reserve service** + hard lock in contract.

6. Partial release model?  
   `A:` **Child records** (immutable history).

7. Insufficient reserve at mint?  
   `A:` **Hard fail**.

8. API surface v1?  
   `A:` **Internal only**.

9. Primary truth TS vs Solidity?  
   `A:` **NodeChain (TS/ledger) = primary.** Solidity = mirror / representation.

10. Capitalization index v1?  
    `A:` **Required:** `reserveIndex = log10(1 + totalProcessVolume)`.

---

## 4. `aroscoin`

1. Symbol / decimals?  
   `A:` **ARO / 9**.

2. Transfer?  
   `A:` Transfer **inside AST** (permissioned, via PoT).

3. Partial split?  
   `A:` **Amount** + min dust (configurable).

4. Primary key?  
   `A:` **processId** (primary) + `claimId`.

5. Double-mint guard?  
   `A:` **Both** TS and Solidity (fail closed).

6. Reassign without burn?  
   `A:` **Only burn + remint** via a new process.

7. Claim expiry?  
   `A:` **Optional** (per asset policy).

8. Rate on mint?  
   `A:` **Manual institutional input** (confirmed valuation); oracle only as transport.

9. Mint entry points?  
   `A:` **Only emission after PoT.** Admin path **forbidden forever**.

10. NodeChain before client ack?  
    `A:` **Yes, mandatory** (strictly before ack) for every mint/burn.

---

# P1–P3

Answers pending. Questions remain in prior template form under component sections as packs are written.

---

## Mapping to packs

| Component | Pack status after this capture |
|-----------|--------------------------------|
| `invariants` | ready (see `docs/components/invariants/`) |
| `pot` | ready (see `docs/components/pot/`) |
| `reserve` | ready (see `docs/components/reserve/`) |
| `aroscoin` | ready (see `docs/components/aroscoin/`) |
