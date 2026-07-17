# Snapshot API

```text
CreateSnapshot(atHeight?) → SnapshotMeta
GetSnapshot(snapshotId | atHeight) → SnapshotMeta + locator
```

### SnapshotMeta

```text
snapshotId, atHeight, stateRoot, journalTipHash, createdUtc, signatures?
```

Creating a snapshot may also `Append` an `execution_snapshot` fact.
