# DTE — Threat Model and Mitigations

**Module:** AST — Aros Studio Tokenomics
**Component:** Decentralized Transaction Encoding (DTE)
**Submodule:** Threat Model and Mitigations
**Stands on:** I1 (PoT-gated origin), I5 (determinism), I6 (no speculative surface), I7 (Eye veto), I8 (append-only causality). See `01_coin_engine/README.md` §1.

---

## 1. Purpose

State the attack surfaces against the encoding pipeline and, for each, the mitigation and the **invariant that mitigation defends**. A DTE threat is any attempt to make PoT confirm something other than *the* canonical encoding of an authentic transaction. The invariants are not a checklist bolted on afterward; they are what "secure" means here.

---

## 2. Attack surfaces

1. **Transaction input** — malicious or malformed submission.
2. **Encoding nodes** — a compromised node emitting non-canonical bytes.
3. **Quorum agreement** — collusion to pass a non-canonical package.
4. **Network transport** — interception or alteration in flight.
5. **Governance path** — abuse of an encoding-rule change.

---

## 3. Threats and mitigations

### 3.1 Malicious transaction injection
**Description:** A crafted transaction aims to break the parser or exhaust resources.
**Impact:** Node crash, resource exhaustion, denial of service.
**Mitigation:**
- Strict validation against the canonical `transaction.schema.json` before any encoding — an ill-formed transaction is not a cause PoT could confirm and is rejected at the gate (I1).
- Input sanitization and a resource-bounded encoding sandbox (CPU/memory limits).
**Defends:** I1 (only a valid cause proceeds).

### 3.2 Compromised encoding node
**Description:** A node deliberately emits altered (non-canonical) bytes.
**Impact:** A non-canonical package could reach PoT.
**Mitigation:**
- **Bit-identical quorum** (`ENCODING_QUORUM_MIN = 3`, `ENCODING_MATCH = 1.0`): a single node's divergent output cannot match the honest majority's canonical bytes, so no package is handed off (I5).
- **Identity + PoT reputation gate:** an encoding node is admitted by verified service identity and its PoT reputation — the on-chain record of confirmed work — **not** by any held stake or deposit (I6). Reputation cannot be manufactured cheaply because it exists only as confirmed work already on NodeChain (I3).
- **Quarantine on divergence:** a node exceeding a 3% divergence rate over a 100-transaction window is removed from quorum selection; its reputation falls with its lost confirmed work. This is exclusion from work, not forfeiture of a held stake — there is none to forfeit (I6).
**Defends:** I5 (canonical bytes only), I6 (no stake gate), I3 (reputation is earned).

### 3.3 Quorum collusion
**Description:** Colluding nodes all emit the *same* non-canonical encoding, hoping to pass agreement.
**Impact:** A falsified package could satisfy the equality test.
**Mitigation:**
- **Determinism cross-check:** because the canonical encoding is a pure function of inputs (I5), any observer — including an independently selected checker node and the Eye — can recompute the correct bytes from the recorded inputs and expose the collusion; agreement among liars still fails against the function's true output.
- **Randomized quorum selection per transaction** so a colluding set cannot reliably own a transaction's quorum.
- **Eye veto:** the Eye recomputes and halts hand-off of any package that is not the canonical encoding of its inputs, before any effect is acknowledged (I7).
- **Reputation loss:** nodes shown to have emitted non-canonical bytes lose PoT reputation (loss of confirmed-work standing), not a held deposit (I6). There is no stake to slash, because I6 leaves no object for one.
**Defends:** I5 (recomputable truth), I7 (veto), I6 (no slashable stake).

### 3.4 Network interception / MITM
**Description:** An attacker intercepts a package in transport.
**Impact:** Payload replacement, delay, or censorship.
**Mitigation:**
- Mutual TLS (1.3+) between encoding and validation nodes; DTE is service-to-service with no public surface.
- **Content addressing:** the receiving PoT node recomputes the SHA3-512 digest from the bytes; any alteration fails the address check (I5).
- The canonical package is on NodeChain before hand-off (I8), so a dropped or delayed copy in transport cannot erase the recorded cause.
**Defends:** I5 (integrity), I8 (recorded before used).

### 3.5 Governance exploitation
**Description:** A proposal tries to weaken the encoding rule (e.g. reintroduce a node-dependent step, or drop legacy decode).
**Impact:** Backdoored determinism or orphaned historical causes.
**Mitigation:**
- Role-based review certifies every change against I5 (determinism preserved) and I8 (backward decode preserved) before activation; no token vote can override this because I6 leaves no franchise (see `dte_governance_upgradability.md`).
- Every change record is appended before effect (I8); the Eye may veto (I7).
- Automated canonical-form diff on each proposal.
**Defends:** I5, I8, I6, I7.

---

## 4. Risk assessment

| Threat ID | Category | Likelihood | Impact | Priority | Primary invariant |
|---|---|---|---|---|---|
| T1 | Malicious transaction injection | Medium | High | High | I1 |
| T2 | Compromised encoding node | Medium | High | High | I5 |
| T3 | Quorum collusion | Low | High | Medium | I5, I7 |
| T4 | Network interception / MITM | Medium | Medium | Medium | I5, I8 |
| T5 | Governance exploitation | Low | High | Medium | I5, I8, I6 |

---

## 5. Continuous security measures

- **Determinism replay:** continuously re-encode recorded transactions and assert identical digests across nodes (I5) — the standing detector for a drifting or compromised encoder.
- **Fuzz testing** of the transaction parser to keep §3.1 mitigations effective.
- **Live monitoring** of quorum divergence rate, per-node PoT reputation, and hand-off latency; a rising divergence rate is an early signal of §3.2/§3.3.

Every measure above is a restatement of an invariant as an observable check. Nothing here relies on a held stake, a deposit, or a market price — I6 leaves no object for any of those; integrity rests on determinism (I5), recorded causality (I8), earned reputation (I3), and the Eye's veto (I7).
