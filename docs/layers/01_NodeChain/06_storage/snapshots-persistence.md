# Snapshots persistence

## Storage

Snapshots may live:

- as blobs in object store with hash on journal; or  
- as records/files co-located with RocksDB.

Always store `stateRoot` + `atHeight` + `journalTipHash` integrity fields.

## Trust

A snapshot is trusted only if:

- signatures/attestation policy satisfied (if multi-party); and  
- optional full replay sample verifies; and  
- tip hash matches journal.

## IPFS / content-addressed stores

Optional transport for snapshot blobs; **not** a replacement for primary journal.
