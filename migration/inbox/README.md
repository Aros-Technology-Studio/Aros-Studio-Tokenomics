# Migration inbox

Drop **candidate** documentation here **before** it becomes product docs.

```bash
# from repo root — scan this inbox
npm run check:migration

# or scan an external export path
bash .github/scripts/migration-doc-gate.sh /path/to/legacy/docs
```

1. Automated gate must **PASS** (or file goes to `migration/quarantine/` with reason).  
2. Complete `docs/migration/REVIEW_CHECKLIST.md`.  
3. Only then promote into `docs/…` (prefer component 4-file packs).  
4. Run `npm run check:canon`.

See `docs/MIGRATION_GATE.md`.
