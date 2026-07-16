# Agent instructions — Aros Studio Tokenomics (AST)

## Language

| Context | Language |
|---------|----------|
| Chat / conversation with the product owner | **Russian** |
| Everything written into this repository | **English** |

Repository artifacts include (non-exhaustive): code, comments, tests, `docs/`, commit messages, PR titles and bodies, issue text intended for the repo, CI messages, and file/folder names unless an existing proper noun requires otherwise.

Do not mix Russian into repository files. Explain in Russian in chat; implement and document in English in the tree.

## Canon and process

- **Source of truth:** root `CANON.md` (AST Core Canon v1.0 Final) — immutable except by formal amendment
- Order when documents conflict: `CANON.md` → `docs/` → `src/`
- Component docs use the lean four-file pack under `docs/components/` (see `docs/DOC_MAP.md`)
- Follow `docs/principles/ANTI_POLICE.md` and hard prohibitions in `CANON.md` §X
- All-Seeing Eye: **observe / record / notify only** — no veto, no rollback (`CANON.md` §4.3, §X)
- No bypass of **NodeChain** or **PoT** on significant operations
- Token identity is **AST Token Protocol** (canonical layer in NodeChain + PoT); ERC standards are **adapters only**

## Stack (reminder)

TypeScript / NestJS core; tests with Jest; Node ≥ 20.
