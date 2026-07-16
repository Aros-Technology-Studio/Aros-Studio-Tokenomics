# MODEL — `node-reputation`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §9.8, §XII

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| ReputationRow | Success/total counters + optional suspend clock | `nodeId` |
| ReputationScore | Scalar in [0, +∞) for ranking/weight | derived |
| Weight | Non-negative commission weight | derived from score |
| GraceWindow | Time after suspend before restore eligible | default 24h |

---

## States and lifecycle

```
active participation
  → recordParticipation(success|fail)
  → reputation / weight update

suspendWithGrace(nodeId)
  → nodes.status = suspended (quorum exclude)
  → suspendedAt = now
  → grace 24h

maybeRestore(nodeId) when now - suspendedAt ≥ grace
  → nodes.status = active
  → clear suspendedAt
```

No slashing path. No automatic fund movement.

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| local | total ≥ successes ≥ 0 | reject / clamp record |
| local | weight = max(reputation, 0) | no negative weight |
| local | suspend does not burn/seize ARO | fail if any fund path attached |
| §XII | grace default 24h | config may override only via documented config, not silent hardcode sole source |

---

## Formulas / constants

```
nodeReputation = (Σ successful / Σ total) × uptimeFactor
```

- `uptimeFactor` ∈ [0, 1] typically; default min uptime target on nodes pack: **95%**.  
- If `total = 0` → reputation **0** (no free reputation).  
- Default **suspend grace:** 24 hours (`CANON` §XII).  
- Multi-node same institution: **1 vote per cert** (nodes/PoT); reputation is per `nodeId`.

---

## Anti-scope

- Not a slashing engine.  
- Not KYC/compliance police.  
- Not Eye veto.  
