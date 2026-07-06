# DTE — Testing & Benchmarking

**Module:** AST — Aros Studio Tokenomics
**Component:** Decentralized Transaction Encoding (DTE)
**Submodule:** Testing & Benchmarking Methodology
**Stands on:** I1 (PoT-gated origin), I5 (determinism), I7 (Eye veto), I8 (append-only causality). See `01_coin_engine/README.md` §1.

---

## 1. Purpose

Define how DTE is tested. Testing here is not a separate quality policy; it is the **restatement of the invariants as assertions over the encoding record**. The single most important assertion is determinism: the same validated transaction must encode to the same bytes on every node (I5). Every other test supports that or the causal order around it (I1, I8).

---

## 2. Testing scope

1. **Determinism tests** — identical bytes/digest across nodes for identical inputs (I5). *Primary.*
2. **Functional tests** — valid transactions encode to the pinned canonical form.
3. **Negative tests** — malformed or unsigned transactions are rejected at the gate (I1).
4. **Integration tests** — DTE → NodeChain append → PoT hand-off, in causal order (I8, I1).
5. **Performance benchmarking** — encoding speed, latency, resource use (operational).
6. **Security regression tests** — mitigations from `dte_security_threat_models.md` remain effective.

---

## 3. Test types and methodology

### 3.1 Determinism testing (primary)
- **Goal:** prove the encoding is a pure function of canonical inputs (I5).
- **Method:**
  - Encode each canonical vector on ≥3 independent nodes and require **100% bit-identical** output (`ENCODING_MATCH = 1.0`).
  - Re-encode across heterogeneous hosts (different CPU/arch) to catch any platform-dependent step (float, endianness, map ordering).
  - Replay recorded transactions from NodeChain and assert the digest is unchanged.
- **Pass bar:** exact equality. A single differing bit is a failure, not a tolerance to widen — I5 admits no "close enough."

### 3.2 Functional testing
- **Goal:** valid transactions produce the pinned canonical bytes.
- **Method:** run the canonical AST transaction dataset; compare each output digest to its pinned expected value in `tests/dte_vectors.json`.

### 3.3 Negative testing
- **Goal:** an invalid or inauthentic transaction never becomes an encoded cause (I1).
- **Method:** inject fuzzed payloads, deliberate schema violations, and bad/absent signatures; expect rejection at Pre-Encoding Validation with the correct error code. No package is appended or handed to PoT.

### 3.4 Integration testing
- **Goal:** verify causal order end to end (I8, I1).
- **Method:** simulate encode → **append to NodeChain** → hand off to PoT → verdict. Assert the package record exists on-chain *before* any PoT verdict references it (I8), and that no unit is caused within DTE itself (I1).

### 3.5 Performance benchmarking (operational)
- **Metrics:** encoding latency (ms/tx), throughput (tx/sec), CPU %, memory (MB).
- **Tools:** node-level benchmark scripts in **TypeScript** (NestJS harness) driving the **Rust** serializer; metrics scraped to a monitoring stack.
- **Thresholds:** encoding latency ≤ 50 ms/tx; throughput ≥ 500 tx/sec/node under normal load; quorum agreement + append ≤ 150 ms.
- These are operational targets. They never override the correctness gate: a fast encoding that diverges across nodes fails (I5).

### 3.6 Security regression testing
- **Goal:** known attack vectors stay blocked after any change.
- **Method:** re-run the §3 threat-model checks after each schema or rule change; replay archived security incidents; assert the Eye still vetoes a planted non-canonical package (I7).

---

## 4. Benchmark environment

- **Testnet:** ≥5 encoding nodes + ≥3 PoT validators.
- **Simulated network latency:** 50–200 ms, to exercise transport and hand-off under delay.
- **Persistence:** PostgreSQL 15 for the encoding record, vector set, and archived packages (backward-decode regression).
- **Toolchain:** NestJS/TypeScript orchestration, Rust deterministic serializer, Solidity governance hooks, PostgreSQL storage — the canonical AST stack; no other runtime is introduced.

---

## 5. Reporting

- Automated test report in JSON + human-readable Markdown per run.
- Determinism results are foregrounded: any node whose output diverged is named for isolation (feeds §3.2 of the threat model).
- Benchmark history archived to PostgreSQL for 12 months; operational alerts on KPI deviation > 5% from baseline. A determinism failure is never a warning — it blocks release.
