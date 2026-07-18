# Purpose — 01_NodeChain

## One sentence

NodeChain is the **sole source of truth** for significant events in AST: an append-only, cryptographically chained journal with ExecutionSnapshots.

## Why it exists

AST records institutional tokenization and the lifecycle of rights.  
Without a single immutable causal record:

- events can be disputed or rewritten;
- emission and settlement cannot prove their causes;
- replay and audit are impossible.

NodeChain is that record. It does **not** invent value and does **not** appraise assets. It **persists and orders** facts that other layers produce under process rules.

## What “significant event” means

Any event that affects rights, value recognition, process state, or settlement outcome must be journaled, including (non-exhaustive):

- process open / stage transition / process close;
- references to PoT evidence and verdicts (as **records**, not PoT logic);
- mint / burn / transfer / revaluation **acknowledgements** (as facts after gated layers act);
- commission settlement facts;
- node admission, suspend, restore (as operational facts);
- governance parameter changes that affect execution.

If it is significant and has no NodeChain record, it is **invalid** for AST purposes.

## Success criteria for this layer

1. Every accepted significant effect has a prior durable append (write-ahead).  
2. The journal is append-only and immediately immutable.  
3. Replay of the journal yields the same logical state (determinism).  
4. Other layers never bypass NodeChain for significant operations.  
5. All-Seeing Eye and ops can observe the journal/event stream without owning write rules.

## Relationship to the product outcome

Institutional process → (other layers validate) → **NodeChain records** → token and rights state that can be audited forever.  
NodeChain is the spine of that chain, not the whole body.
