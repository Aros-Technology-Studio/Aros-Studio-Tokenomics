# Immutability

## Rule

Once a record is **durably accepted** (assigned `height`, fsynced / consensus-durable per storage policy), it is **immutable**.

## Forbidden operations

- Update payload or header of an existing height  
- Delete a height  
- Reassign height  
- Rewrite `prevHash` / `contentHash`  
- Soft-delete flags that hide records from the canonical chain

## Corrections

Errors are corrected by **new compensating records**, never by editing history:

- wrong economic intent → new process / reverse records as product rules allow;  
- bad metadata → `correction_note` or superseding record with explicit `supersedesRecordId`.

## Retention

Immutability is not “keep forever on one disk forever” without ops policy.  
Retention/backup may archive cold segments **intact**.  
Purging historical SoT data is a **governance/legal** decision outside silent compaction that drops records without archive.

## API language

APIs must not expose `updateRecord` or `deleteRecord` for the main journal.  
Admin “repair” tools that rewrite history are **non-canon** and forbidden in production paths.
