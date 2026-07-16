# MODEL — `nodes`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| Institution | Legal participant | institutionId + certificate |
| Node | Runtime participant under institution | nodeId + key pair |
| Role | Fixed capability | executor \| confirmer/validator \| observer |
| Heartbeat | Liveness signal | nodeId + timestamp |
| Reputation | Eligibility signal | score + history |
| Quorum membership | Active confirmer set | process- or epoch-scoped |

---

## States and lifecycle

```
registered (pending approval) → active → suspended (grace) → active
active → retired
```

Suspend path: reputation decrease → temporary exclusion from quorum → grace period → restore or stay out. **No slashing.**

---

## Invariants

| Rule | Effect if violated |
|------|--------------------|
| Unapproved node cannot confirm | reject |
| Below uptime threshold | exclude from quorum |
| Jurisdiction constraint fail | reject registration/assignment |

---

## Constants (defaults)

| Name | Default | Notes |
|------|---------|-------|
| minUptime | 0.95 | configurable |
| roles | fixed set v1 | — |
