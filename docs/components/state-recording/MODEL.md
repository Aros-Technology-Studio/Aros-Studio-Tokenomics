# MODEL — `state-recording`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| State record | Snapshot of process state in NodeChain | processId + sequenceId |
| payloadHash | Hash of payload | content-addressed |
| prevStateHash | Prior record link | hash chain |
| Replay report | Determinism check result | processId + runId |

---

## Schema (required fields)

| Field | Notes |
|-------|--------|
| processId | mandatory correlation |
| sequenceId | order within process |
| timestamp | event time |
| stateType | kind of snapshot |
| payloadHash | integrity |
| prevStateHash | chain |
| validatorId | who attested / wrote path |
| status | lifecycle status |

---

## States and lifecycle

```
intent → write state record (encrypted if sensitive) → side effect allowed → ack
record fail → fail closed (no side effect)
```

Immutability: forever. No redaction.

---

## Relationship to NodeChain

**State-recording = process state snapshots inside the NodeChain ledger** (not a second chain).

---

## Invariants

| Rule | Effect |
|------|--------|
| I3 — no significant progress without record | fail closed |
| I4 — replay must match | fail closed on divergence |
| no redaction | reject redaction APIs |
