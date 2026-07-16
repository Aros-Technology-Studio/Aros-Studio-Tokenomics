# Process: Ownership transfer (transfer of rights)

**Status:** Canonical process description (v1)  
**Canon:** Core Canon §4.1, §5.3, §6.3–6.4 (critical ops), I1–I4, I3 (NodeChain), §X hard prohibitions  
**Decisions:** orchestrator sole entry; pot + nodechain write-ahead; token protocol Canonical Layer  
**Entry:** Institution and/or authorized parties → **Orchestrator only**  
**Code (target):** `src/orchestrator/`, `src/pot/`, `src/nodechain/`, `src/aroscoin/` (transfer path), adapters as non-SoT

---

## 1. Purpose

After primary tokenization, **any transfer of rights** on the tokenized asset **must** pass through AST. NodeChain is the permanent registry of rights. Off-chain or traditional-registry-only transfers that skip AST are **not** recognized as valid network events.

This process records a **confirmed transfer of rights** with PoT and NodeChain, updates token balances / claim holders under the AST Token Protocol, and requires the traditional registry to carry the mark that the asset is tokenized (lifecycle duty; AST remains infrastructure of record, not a valuation or third-party custody house).

---

## 2. Why fail-closed without ledger

Core Canon:

- Any significant action without a NodeChain record is **invalid**.  
- All critical operations (mint, burn, **transfer**, revaluation) pass through **NodeChain + PoT**.  
- Bypassing NodeChain and PoT on any significant operation involving a tokenized asset is a **hard prohibition**.

Therefore:

| Attempt | Outcome |
|---------|---------|
| Transfer only on ERC adapter / external chain | **Invalid** as AST rights event; adapters are not SoT |
| Transfer only in traditional registry after tokenization | Incomplete; must update AST |
| Transfer with PoT but no NodeChain append | **Fail-closed** — no client ack of completed transfer |
| Transfer with ledger write but `verified ≠ 1` | **Invalid** — value/rights change not recognized |

---

## 3. Preconditions

| Requirement | Rule |
|-------------|------|
| Asset tokenized | Primary tokenization completed; traditional registry marked tokenized |
| Parties authorized | Holder / institution / policy-allowed transferor and transferee |
| Institutional context | P1 allowlist / cert rules for process type |
| Documents | Transfer package + qualified signatures as required by process type |
| New processId | Full orchestrator process; no silent balance rewrite |
| Idempotency | Mandatory `idempotencyKey` |
| Release gates | Pre–Release Phase: external free-market transfer blocked (I8); internal transfer of rights still goes through AST |

---

## 4. Actors

| Actor | Role |
|-------|------|
| Transferor / transferee | Rights parties (holder and/or institution as policy) |
| Institution | Often co-approves or initiates per asset policy |
| Orchestrator | Sole economic / rights-process entry |
| Quorum validators | PoT P1–P4 |
| NodeChain | Sole source of truth for the transfer event |
| ArosCoin / token protocol | Balance/claim reassignment only after PoT + ledger |
| Traditional registry | External mark of tokenization; not a substitute for NodeChain |
| Representation adapters | May mirror transfer; **never** SoT |
| All-Seeing Eye | Observe / alert only |

---

## 5. Process steps (orchestrator-aligned)

Ownership transfer is a first-class process type with the same fail-closed skeleton:

| # | Step | Transfer-specific notes |
|---|------|-------------------------|
| 1 | StartProcess | `processId`; link asset id, from/to parties, claim ids |
| 2 | Documents + signature | Transfer instruments, institutional package, КЭП |
| 3 | Oracle (if required) | Title / external checks only if policy requires; fail-closed |
| 4 | PoT Evaluation | Fact of executed transfer process validated (not hash-power consensus) |
| 5 | NodeChain record | **Write-ahead** transfer event; ExecutionSnapshot; fail-closed if append fails |
| 6 | Token effects | Reassign rights: burn+remint or protocol transfer **only after** ledger height; reassign = burn+remint where double-mint guards require |
| 7 | Settlement | Commission post-factum if schedule applies |
| 8 | State + notify | Snapshots; notify parties; Eye observes |
| 9 | EndProcess | Terminal status |

Compensation only **before** `verified = 1`. After verified, rights change is not Eye-reversible.

---

## 6. PoT criteria (all four always)

| ID | Ownership-transfer meaning |
|----|----------------------------|
| **P1** | Allowed context: valid institutional cert + allowlist; parties in permitted roles |
| **P2** | Full transfer stage sequence completed |
| **P3** | Significant states recorded in NodeChain |
| **P4** | Completed under ownership-transfer process-type rules (deterministic from/to result) |

Any fail → `verified = 0` + reason codes → **no** balance/rights mutation. Timeout **15m** → expired → new processId.

---

## 7. NodeChain as registry of rights

After primary tokenization (Core Canon §5.3):

- The asset loses ability to circulate fully in the traditional regime **without updates in AST**.  
- Transfer of rights **must** pass through AST.  
- Traditional registry holds a mark that the asset is tokenized; it does not replace NodeChain.

Normative append content (minimum intent):

- `processId`, parties, asset/claim identifiers  
- ExecutionSnapshot (hash + prevHash)  
- PoT verdict reference  
- Resulting holder map / transfer delta  
- Timestamps in **UTC**

Without this record, the transfer is **invalid** in AST.

---

## 8. Token protocol rules

- **Canonical Layer:** state always lives in NodeChain + PoT.  
- **Abstract Interface:** AST transfer semantics, not ERC-first.  
- **Adapters (ERC-20/3643/1400, …):** optional mirrors; success on adapter alone never completes the process.  
- Critical path: transfer always through NodeChain + PoT.  
- Reassignment patterns that risk double-mint must use **burn + remint** discipline (aroscoin pack).

---

## 9. Relation to Selective Custody and I8

- AST does **not** take third-party custody of funds to “hold during transfer.”  
- Pre–Release Phase: free external / CEX / public trading paths remain blocked; internal rights transfer still uses this process.  
- Post–Release Phase: external circulation may open under compliance, but **registry of rights** remains NodeChain.

---

## 10. Fail-closed summary

| Failure | Outcome |
|---------|---------|
| Missing signatures / unauthorized party | Reject |
| PoT fail or timeout | No rights mutation |
| NodeChain append fail | No transfer completion; no client ack |
| Adapter-only transfer | Not recognized as AST completion |
| Kill-switch / read-only | No new transfer processes |

---

## 11. Hard prohibitions

- Silent off-ledger ownership changes.  
- Using Eye for veto/rollback of a verified transfer.  
- Treating ERC balance as sole source of truth.  
- Free mint as a side-effect of transfer.  
- Third-party custody of participant assets by AST.

---

## Related

- Lifecycle: Core Canon §5.3  
- Sibling: [primary-tokenization.md](./primary-tokenization.md), [revaluation.md](./revaluation.md)  
- Packs: `orchestrator`, `pot`, `nodechain`, `aroscoin`, `state-recording`  
- Token protocol: Core Canon §VI
