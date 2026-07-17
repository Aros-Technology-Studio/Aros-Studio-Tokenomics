# Record types catalog (v1 baseline)

Types are strings. Payload schemas versioned per type.  
This list is extensible; unknown types reject on append until registered.

## Process lifecycle

| recordType | Meaning |
|------------|---------|
| `process_open` | Process created |
| `process_stage` | Stage transition |
| `process_close` | Process completed or aborted |
| `process_abort` | Failed closed with reason codes |

## PoT (stored facts only)

| recordType | Meaning |
|------------|---------|
| `pot_evidence` | Evidence package ref / hashes |
| `pot_verdict` | `verified` 0\|1 + reason codes + validator set refs |

## Economic facts (written by token/settlement layers)

| recordType | Meaning |
|------------|---------|
| `mint_fact` | Mint occurred (amounts, holders) |
| `burn_fact` | Burn occurred |
| `transfer_fact` | Rights transfer |
| `revaluation_fact` | ΔValue application fact |
| `commission_settled` | Settlement batch fact |
| `payment_credited` | Node payment credit fact |

## Nodes / system

| recordType | Meaning |
|------------|---------|
| `node_register` | Node admitted |
| `node_suspend` | Suspended |
| `node_restore` | Restored |
| `param_change` | Parameter change |
| `execution_snapshot` | Snapshot commitment |
| `genesis` | Chain anchor |

## Naming

Prefer `*_fact` for economic results to stress NodeChain stores facts, not engines.
