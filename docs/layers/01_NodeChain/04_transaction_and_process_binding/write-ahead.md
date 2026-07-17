# Write-ahead

## Rule

For any significant effect E with cause C:

1. Record(s) representing C are **durably appended**;  
2. Only then may E be acknowledged to clients or external systems.

## Examples

| Effect | Cause records first |
|--------|---------------------|
| Ack “tokenized” to institution | process + pot_verdict verified=1 + mint_fact |
| Payment credit visible | pot/settlement facts + payment_credited |
| Parameter takes effect | param_change record |

## NodeChain’s job

Provide durable append + ack with height.  
Callers implement the “don’t ack early” discipline; orchestrator enforces pipeline order.

## Violation

Acknowledging effects without journaled causes is a **canon-level defect**, not a soft warning.
