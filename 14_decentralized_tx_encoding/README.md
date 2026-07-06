# Decentralized Transaction Encoding (DTE)

**Path: AROS-PARADIGM-AST/14_decentralized_tx_encoding/README.md**

The DTE layer takes a raw transaction and turns it into one canonical, byte-for-byte reproducible package — the exact object PoT confirms and NodeChain records. DTE sits *upstream* of emission: nothing in this layer mints, burns, or pays. It produces the deterministic encoding on which the whole causal chain later depends. It is described entirely on AST's own terms — NodeChain, PoT (Proof-of-Transaction), nodes, ArosCoin (ARO), the All-Seeing Eye — and names no external system.

⸻

## 0) How to read this layer

Every rule here is a **consequence**, not a preference. DTE stands on the invariant spine defined in `01_coin_engine/README.md` §1; each document below states which invariants it rests on and derives its mechanics from them by an explicit *because → therefore* chain. If a rule cannot be traced to an invariant, it does not belong here.

Two invariants do most of the work in this layer:

- **I5 — Determinism.** Every token movement is reproducible from canonical inputs recorded in NodeChain. *Because* PoT must reach the same verdict on every node, the encoding those nodes confirm must be identical on every node. DTE is the mechanism that makes the transaction's canonical form single-valued. If two honest nodes could encode the same transaction into two different byte strings, I5 would be unreachable.
- **I8 — Append-only causality.** Every cause is appended to NodeChain before its effect is acknowledged. The encoded package *is* the cause that PoT later consumes; therefore DTE finishes by appending an immutable, content-addressed record, never by acting on it.

DTE also inherits **I1** (only a PoT verdict causes a unit — DTE precedes and enables that verdict, and causes no unit itself), **I6** (no speculative surface — so no held stake gates encoding), and **I7** (the Eye observes every DTE step and can veto a non-canonical package, but never encodes anything itself).

⸻

## 1) What DTE is, causally

```
raw transaction (fields, sender signature)                    [input]
      │
      ├─▶ Pre-Encoding Validation  — is this a well-formed, authentic cause?      [I1, I5]
      │
      ├─▶ Deterministic Encoding   — canonical bytes, produced identically by a quorum of nodes  [I5]
      │
      ├─▶ Quorum Agreement         — the nodes' encodings must be bit-identical                   [I5]
      │
      └─▶ Finalization             — content-addressed package appended to NodeChain              [I8]
                                     then handed to the PoT pipeline for a verdict                [I1]
```

The single job of the layer: guarantee that the object PoT sees is **the** encoding of the transaction, not *an* encoding — one value, reproducible by anyone from the recorded inputs.

⸻

## 2) Directory layout (skeleton)

```
14_decentralized_tx_encoding/
├── README.md                        # This file — how DTE serves I5/I8 and maps the layer
├── decentralized_tx_encoding.md     # The encoding pipeline, format, and quorum, derived from invariants
├── dte_governance_upgradability.md  # How an encoding rule changes — role-based AI oversight, never a vote
├── dte_security_threat_models.md    # Attack surfaces and the invariant each mitigation defends
└── dte_testing_benchmarking.md      # Tests restated as assertions of the invariants
```

If a referenced `/tests` or `/fixtures` directory is absent in a checkout, keep the structure and add stubs; tests must continue to assert the invariants unchanged.

⸻

## 3) Canonical constants used here

DTE introduces no economic constant; it consumes the canonical set from `01_coin_engine` and adds only operational thresholds for the encoding quorum.

| Constant | Value | Meaning |
|---|---|---|
| `SYMBOL` | `ARO` | Ticker of ArosCoin (the transacted asset). |
| `DECIMALS` | `9` | Amount precision; DTE serializes amounts in `arx` integers, never floats (I5). |
| `BASE_UNIT` | `arx` | `1 ARO = 10^9 arx`; amounts are encoded as integer `arx` to keep encoding exact. |
| `ENCODING_QUORUM_MIN` | `3` | Minimum encoding nodes that must independently produce the package (operational). |
| `ENCODING_MATCH` | `1.0` | Required agreement: **bit-identical** output across the quorum. Determinism admits no "majority-close" (I5). |
| `POT_EPOCH_SECS` | `600` | Reference epoch for batched hand-off to PoT (operational, not economic). |

Note the difference from a probabilistic consensus: because the encoding is a *pure function* of canonical inputs (I5), honest nodes do not "vote" on the bytes — they must all compute the same bytes. Any divergence is a fault to be located, not a minority to be outvoted.

⸻

## 4) Governance of DTE (bounded, role-based)

An encoding rule (schema version, field order, digest algorithm) can change, but only within the AST governance model: a **role-based hierarchy of AI oversight**, recorded in NodeChain before effect (I8) and reproducible (I5). There is no token-weighted vote and no holder franchise — a held ARO balance confers no say here, because I6 leaves no object for governance-by-holding. The All-Seeing Eye sits at the apex with veto (I7) but initiates no change. Details in `dte_governance_upgradability.md`.

⸻

## 5) Security & halting

- **Zero-trust transport:** service identity → mutual TLS between encoding and validation nodes; DTE is service-to-service, with no public end-user surface.
- **Eye veto (I7):** if a finalized package is not the canonical encoding of its inputs, the Eye halts its hand-off to PoT before any effect is acknowledged. The halt is a *stop*, never a substitution — the Eye does not re-encode.
- **Sybil resistance (I6):** an encoding node is admitted by verified service identity and its PoT reputation — the accumulated record of confirmed work — **not** by any held stake or deposit, because I6 leaves no object for a participation stake. See `dte_security_threat_models.md` §3.2.

⸻

## 6) What auditing checks

Auditing is the restatement of the invariants as tests over the encoding record:

- **Determinism (I5):** re-encoding a recorded transaction from its canonical inputs yields the identical package hash — on every node, every time.
- **Causal order (I8):** the package record is appended before it is handed to PoT; no PoT verdict references a package not already on-chain.
- **No issuance (I1):** the DTE log contains only encodings and appends — never a mint, burn, or payment authored in this layer.
- **Eye discipline (I7):** the Eye's log contains only observations and vetoes — never an encoding authored by the Eye.
