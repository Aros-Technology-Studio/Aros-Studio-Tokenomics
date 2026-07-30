# F5 — Kill-switch / backup / restore drill

**Status:** Code exists · owner must run drill on schedule  
**Code:** `globalKillSwitch` · file/rocksdb journal · `npm run journal:verify`

---

## Automated offline drill (CI / laptop)

```bash
npm run drill:backup-restore
# expect: DRILL PASS
```

Script (`scripts/drill-backup-restore.ts`):

1. Genesis + first record in temp journal dir  
2. Verify chain ok  
3. Backup (tar/copy)  
4. Simulate kill-switch engage (in-process) blocks write  
5. Restore from backup into new dir  
6. Verify chain ok after restore  
7. Clean temp  

Does **not** replace production volume drills.

---

## Owner production drill (quarterly)

| # | Step | Evidence |
|---|------|----------|
| 1 | Announce maintenance window | ticket |
| 2 | Snapshot `AST_JOURNAL_DIR` (and rocksdb files) | backup path + checksum |
| 3 | `npm run journal:verify` on live | chain.ok |
| 4 | Engage kill-switch (restart with procedure / ops flag) | writes fail closed |
| 5 | Confirm portal/core reject economic writes | logs |
| 6 | Release kill-switch or restore from snapshot | |
| 7 | Verify chain + tip height | |
| 8 | Record duration + gaps | runbook log |

Kill-switch in process: `globalKillSwitch.engage(reason)` (auto on chain fail post-orchestrator).  
Ops may also stop writers / set read-only at proxy while restoring.

---

## Backup notes

| Engine | What to copy |
|--------|----------------|
| `file` | entire `AST_JOURNAL_DIR` (`journal.jsonl`, `tip.json`, keys, at-rest.key) |
| `rocksdb` | journal dir + rocks path consistently |
| Soft-HSM | `.ast-hsm-vault.json` + master key in vault (not only disk) |

Encrypt backups offline. Never commit.

---

## Acceptance

| Check | Status |
|-------|--------|
| Offline drill script green | ✅ `npm run drill:backup-restore` |
| Owner runbook | ✅ this file |
| Quarterly production drill log | **Owner residual** |
