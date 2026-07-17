# Fault tolerance

## Principle

Survive faults **without inventing state**.  
Recovery = **replay journal** (and trusted snapshots), never synthesize missing confirmations.

## Strategies

| Fault | Handling |
|-------|----------|
| Node timeout | Exclude from Q; soft-suspend; reassign work (process layer) |
| Writer crash mid-append | Idempotency key → retry; no double height |
| Network partition | Minority must not finalize a divergent tip; read-only until rejoin + replay |
| Disk corruption | Restore from replica/backup; verify chain |
| Hash mismatch on replicate | Reject segment; alert ops/ASE stream |

## Partition rule

A partitioned minority **does not** mint a second SoT tip.  
It may serve reads of last known verified prefix if policy allows, but not new durable heights that diverge.

## In-flight processes

Process and token layers define burns/settlement completion; NodeChain only guarantees journal durability of whatever they append during recovery.

## From prior materials

Kept: replay-only recovery, no invent state, partition does not finalize divergent truth.  
Dropped as NodeChain duty: Eye veto as recovery actuator; born-and-burned token rules.
