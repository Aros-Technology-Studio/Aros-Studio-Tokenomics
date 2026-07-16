# Notion sync (deferred)

**Status:** Deferred by product owner  
**Issue:** #34  

## Policy

- **Source of truth** for product law is this repository: `docs/AST-CORE-CANON.md` and derived docs.  
- Notion is an optional mirror for humans — never reverse-SoT.  
- Automated Notion ↔ GitHub sync is **out of v1 critical path**.

## When re-enabled

1. Map Notion pages → `docs/` paths explicitly.  
2. Run migration gate on any inbound Notion export (`npm run check:migration`).  
3. Human checklist: `docs/migration/REVIEW_CHECKLIST.md`.  
4. Never promote conflicting multi-system or veto/custody prose.

## Current action

No runtime sync script is required for Phase 0–4 completion. Reopen only when owner schedules ops work.
