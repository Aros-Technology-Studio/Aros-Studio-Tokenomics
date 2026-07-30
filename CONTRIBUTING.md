# Contributing

## Language

- Repository files: **English**  
- Chat with product owner: Russian (agents)

## Law

1. Read `docs/AST-CORE-CANON.md`  
2. Read `docs/P0-P4-TECHNICAL-DECISIONS.md`  
3. Follow layer docs under `docs/layers/`  
4. Run `npm test` and `npm run check:canon` before PR  

## Do not

- Free mint / bypass PoT / All-Seeing Eye veto  
- Third-party custody  
- Fake “Done” without acceptance evidence  
- Portal unless owner re-opens scope  
- **Commit local agent/chat dumps** — `sessions/`, `.grok/` are gitignored (prompts, secrets, firewall-noisy history)

## Commits

Imperative mood, English. Prefer small commits with clear scope.

Before PR: `git status` must not show `sessions/` or chat export trees.  
If you force-add them, CI firewall/canon scans may fail and secrets may leak.
