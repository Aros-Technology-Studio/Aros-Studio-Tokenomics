# Release module family

**Code paths:**  
- `src/release/` — Release Phase state & gates  
- `src/release-daemon/` — threshold monitoring & initiation  
- `src/partial-release/` — position partial release (separate process)  
- `src/velocity-tracker/` — velocity metric  

**Canon:** `docs/AST-CORE-CANON.md` §VII, §9.2, §9.6–9.7, §XI I8, §XII  
**Decisions:** P2 release; P4 partial-release, release_daemon, velocity_tracker  
**Packs:** `docs/components/release/`, `release-daemon/`, `partial-release/`, `velocity-tracker/`

---

## Two different “releases”

| Concept | Module | Meaning |
|---------|--------|---------|
| **Release Phase** | `release` + `release-daemon` | System maturity stage: circulation regime expands beyond internal roles |
| **Partial release** | `partial-release` | Holder+institution process that splits a **position** via burn+remint; **does not** flip phase |

Conflating these is a design error. Partial asset release is a **separate** module path (decisions P2/P4).

---

## Release Phase condition (canon)

```text
ReleasePhase_eligible = (reserveIndex > threshold) ∧ (velocity > target)
```

Where:

```text
reserveIndex = log10(1 + totalProcessVolume)     // reserve module
velocity     = processVolume_24h / circulatingSupply  // velocity-tracker
```

| Config key | Role |
|------------|------|
| `release.threshold` | Numeric threshold for reserveIndex — **config only** (no hard-coded sole source in code) |
| `release.target` | Numeric target for velocity — **config only** |

Env mapping example: `RELEASE_THRESHOLD`, `RELEASE_TARGET`.

---

## Responsibility split

| Concern | Owner |
|---------|--------|
| Phase state machine + external gates | `release` |
| Continuous metric poll + **initiate** when met | `release-daemon` |
| Compute velocity | `velocity-tracker` |
| Compute reserveIndex | `reserve` |
| Partial position process | `partial-release` via **Orchestrator** |
| Governance multi-step for phase | governance + NodeChain |

Daemon **initiates**; phase truth lives in `release` + NodeChain — not in daemon local memory as SoT.

---

## Pre-phase vs post-phase

### Pre–Release Phase (I8) — blocked externally

- Free transfer to external chains  
- CEX listing  
- Public trading  

Tokens exist in **internal roles** only (process unit + payment unit).

### Post–Release Phase — allowed with compliance

- External transfers  
- Bridge  
- Listing (+ compliance)

Compliance is **not** dropped when phase activates.

---

## Module docs in this folder

| File | Topic |
|------|--------|
| [release-phase.md](./release-phase.md) | Phase definition, gates, governance reverse |
| [partial-release.md](./partial-release.md) | Position partial release process |
| [daemon.md](./daemon.md) | release-daemon + velocity inputs |

---

## Hard prohibitions

- Holder self-trigger of **phase**  
- Hard-coded threshold numbers as sole SoT  
- Merging partial asset release into phase module  
- Phase reverse without governance + NodeChain  
- Pre-phase external free circulation leak  
