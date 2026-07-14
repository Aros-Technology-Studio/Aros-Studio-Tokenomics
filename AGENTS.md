# Agent instructions — Aros Studio Tokenomics (AST)

## Language

| Context | Language |
|---------|----------|
| Chat / conversation with the product owner | **Russian** |
| Everything written into this repository | **English** |

Repository artifacts include (non-exhaustive): code, comments, tests, `docs/`, commit messages, PR titles and bodies, issue text intended for the repo, CI messages, and file/folder names unless an existing proper noun requires otherwise.

Do not mix Russian into repository files. Explain in Russian in chat; implement and document in English in the tree.

## Canon and process

- Source of truth order: `CANON.md` → `docs/` → `src/`
- Component docs use the lean four-file pack under `docs/components/` (see `docs/DOC_MAP.md`)
- Follow `docs/principles/ANTI_POLICE.md`: invariants and veto, not policing

## Stack (reminder)

TypeScript / NestJS core; tests with Jest; Node ≥ 20.
