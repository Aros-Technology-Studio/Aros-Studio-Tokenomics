# Migration documentation gate

**Status:** Active  
**Purpose:** Before (and while) moving documentation from any **legacy repository** into this repo, every candidate document must be checked against **Core Canon** and the same hard rules CI enforces on the living tree.

**Source of truth:** `/CANON.md`  
**Related:** `docs/migration/REVIEW_CHECKLIST.md`, `.github/scripts/migration-doc-gate.sh`

---

## 1. Why this exists

Legacy material often carries models that **contradict** Core Canon (multi-system coupling, executive oversight, protocol-as-ERC-native, mint without PoT, speculative surfaces).  

If such text lands directly into product `docs/`, it **poisons** implementation even when well written.

**Rule:** no legacy document becomes product documentation until it **passes the migration gate** (automated hard fail + human semantic review).

---

## 2. Staging layout

```
migration/
├── inbox/                 # drop candidate files HERE first
│   └── README.md
├── quarantine/            # failed hard gate
└── reports/               # machine reports
```

Promoted destinations (only after PASS + human sign-off):

| Destination | Use |
|-------------|-----|
| `docs/components/<name>/` | component packs (rewrite into 4-file pack) |
| `docs/processes/` (when created) | business processes |
| `docs/architecture/` | architecture |
| `CANON.md` | **only** via formal amendment — never silent merge |

---

## 3. Two-layer check

### Layer A — Automated (hard)

```bash
npm run check:migration

# or any path (export from old repo):
bash .github/scripts/migration-doc-gate.sh /path/to/legacy/docs
```

Hard fail classes (script is authoritative; names are short labels):

| Class | Intent |
|-------|--------|
| firewall | legacy multi-system product names must not define AST |
| vocab | banned yield-style tokens (see `canon-gate.sh`) |
| eye-executive | oversight must not veto, roll back, or initiate economic actions |
| premine-stake | no mint-before-process / no passive yield surfaces |
| bypass | no skip of PoT or NodeChain; no admin mint paths |
| erc-sot | external token standards are adapters only, not Sole Truth |
| custody | no holding participants’ third-party funds |
| self-appraisal | AST does not invent official asset prices |

Result: `PASS` | `FAIL` under `migration/reports/`.

### Layer B — Human semantic review (required)

Automation cannot prove full equivalence to canon. Complete  
`docs/migration/REVIEW_CHECKLIST.md` **per document**.

Outcomes: **PROMOTE** | **REWRITE** | **DROP** | **AMEND CANON** (owner only).

---

## 4. Pipeline

```
1. Copy candidates → migration/inbox/
2. npm run check:migration
3. Quarantine or rewrite FAIL files
4. Human checklist for each PASS / REWRITE
5. Promote rewritten English text into docs/ packs
6. npm run check:canon
7. Open PR (architecture paths may require CANON touch)
```

---

## 5. Compatible with canon means

- No §X hard prohibition as a **live feature**  
- Value only with PoT `verified = 1` and NodeChain record  
- Eye observes and notifies only  
- Emission from institutional valuation + ΔValue  
- AST holds only its own funds  
- AST Token Protocol; external standards = representation adapters  
- Pre–Release Phase: internal circulation only  
- No reintroduction of foreign multi-system orchestration as AST dependency  

Detail may be richer than canon; **direction** must not reverse it.

---

## 6. Definition of done (batch)

- [ ] Automated gate PASS (or quarantine with reason)  
- [ ] Checklist done for each promote/rewrite  
- [ ] No dual/conflicting canon in product docs  
- [ ] `npm run check:canon` green  
- [ ] Owner ack on PR or chat  

Until then: **do not implement product behavior from legacy docs.**
