# AST Documentation

**Status:** Structure ratified (2026-07-14)  
**Language:** English (repository language)  
**Source of truth order:** `CANON.md` → `docs/` → `src/`

This directory holds architecture and per-component specifications for **Aros Studio Tokenomics (AST)**. It is intentionally lean: clarity without bureaucracy.

---

## Layout

```
docs/
├── README.md                 # this file
├── DOC_MAP.md                # component ↔ docs ↔ code registry
├── ARCHITECTURE.md           # end-to-end system view
├── principles/
│   └── ANTI_POLICE.md        # design & process rule: avoid policing
└── components/
    ├── _template/            # copy this pack for each component
    │   ├── PURPOSE.md
    │   ├── MODEL.md
    │   ├── CONTRACT.md
    │   └── ACCEPTANCE.md
    └── <component>/          # one folder per canonical component
```

---

## Per-component pack (4 files only)

| File | Deliverable |
|------|-------------|
| `PURPOSE.md` | Why it exists; responsibility boundary; what it does **not** do |
| `MODEL.md` | Entities, states, lifecycle, invariants (linked to CANON) |
| `CONTRACT.md` | Inputs / outputs / events / dependencies |
| `ACCEPTANCE.md` | Done criteria for docs and for later code — not a compliance checklist |

No extra gates, audit trails-as-threat, or “review police” files unless the product owner explicitly requests them.

---

## Principles

See [`principles/ANTI_POLICE.md`](./principles/ANTI_POLICE.md).

---

## Workflow

1. Extend or create a component pack under `components/<name>/` from `_template/`.
2. Align every claim with `CANON.md`. Closed questions stay closed (cite CANON section).
3. Code lands in `src/<name>/` only after the pack is useful enough to implement against — no ceremonial multi-stage approval theater.

---

## Related root documents

| Document | Role |
|----------|------|
| `/CANON.md` | Ratified canon and technical spine |
| `/docs/ARCHITECTURE.md` | Cross-component flows |
| `/docs/DOC_MAP.md` | Registry and priorities |
