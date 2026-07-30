# GitHub issue hygiene — A6 (2026-07-30)

**Goal:** Clear pre–clean-slate noise so open issues match residual AST work only.  
**Repo:** `Aros-Technology-Studio/Aros-Studio-Tokenomics`  
**Status:** **Done** (2026-07-30). Closed via owner account `qetevanarotato-star`  
(`Aros-gitta` can comment but cannot `CloseIssue` on this org).

**Result:** 22 issues closed; **3 remain open** (#52, #41, #34).

---

## Close — MIGRATE (clean-slate done)

| # | Title | Reason |
|---|--------|--------|
| 61 | MIGRATE: delete old-repo deposit/staking | Not in AST SoT; reputation = `src/nodes` |
| 60 | MIGRATE: purge legacy product names from old src/ | Firewall clean; AST reserve path |
| 59 | MIGRATE: remove coin_engine | Folded into PoT + Token (layers 04–05) |
| 58 | MIGRATE: junk sweep | Clean tree |
| 43 | MIGRATE: ArosCoinReserveManager.sol | Representation only: `contracts/…/ArosCoinView.sol` |
| 42 | MIGRATE: transfer clean core → new repo | **This repo is the clean core** |

## Close — DOC / RULES / CI (shipped; often superseded by #31–#54)

| # | Title | Evidence |
|---|--------|----------|
| 16 | CI invariants firewall | `npm run check:canon`, workflows under `.github/` |
| 15 | AST_RULES.yaml | `rules/AST_RULES.yaml` |
| 14 | CANON-00 root | `CANON.md` + `docs/AST-CORE-CANON.md` |
| 13 | CHANGELOG | `CHANGELOG.md` (#54) |
| 12 | CONTRIBUTING | `CONTRIBUTING.md` (#54) |
| 11 | SECURITY | `SECURITY.md` (#54) |
| 10 | ROADMAP | `docs/ROADMAP.md` (#51) |
| 9 | INTAKE | `docs/INTAKE.md` (#53) |
| 7 | STRUCTURE | `docs/STRUCTURE.md` (#49) |
| 6 | README | `README.md` (#50) |

## Close — portal INTERFACE (pilot path shipped)

| # | Title | Evidence |
|---|--------|----------|
| 39 | Issuer Portal interface | `portal/` edge |
| 28 | issuer_portal | same |

Residual portal (do **not** re-open these numbers): QES/X.509, mTLS — `docs/portal/MVP-FINISH-TRACK.md`.

## Close — noise / duplicates

| # | Title | Reason |
|---|--------|--------|
| 71 | documentation | Empty title/body |
| 19 | (write new — no source doc) | Empty |
| 8 | DOC-03 ONTOLOGY | Duplicate → keep **#52** |
| 36 | DOC ONTOLOGY Application | Duplicate → keep **#52** |

---

## Keep open (re-scoped)

| # | Title | Status after A6 |
|---|--------|-----------------|
| **52** | DOC: `docs/ONTOLOGY.md` | **Single** ontology ticket; file still missing |
| **41** | LEGAL: regulatory verification | Owner/legal only |
| **34** | SYNC: mirror docs to Notion | Owner-deferred; GitHub `docs/` remains SoT |

---

## After owner closes

Update `docs/BACKLOG.md` open-issue count if desired. Residual engineering: `docs/COMPLETION-TRACK.md` (A7+, B…, I…).

---

## Permission fix (optional)

Grant the automation account **Issues: Write** (or use a PAT with `repo` scope) so future hygiene can close via `gh issue close`.
