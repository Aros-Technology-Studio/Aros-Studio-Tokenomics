# Pre-verdict challenges

Any **open** challenge on a processId blocks `verified=1`.

## Journal

| recordType | Meaning |
|------------|---------|
| `pot_challenge_open` | Open a challenge (challengerId + reason) |
| `pot_challenge_close` | Close one open challenge (closerId + resolution) |

Legacy journals may use `param_change` with `kind: pot_challenge_open|close` — still counted.

## Rules

1. Open count increments on open, decrements on close (floor 0)
2. If openCount > 0 at verify → `challengeBlocked=true`, `verified=0`, reason `CHALLENGE_OPEN`
3. Challenges are **pre-verdict** only; they do not roll back a final `verified=1` (double-confirm / already-final still applies)

## API

```ts
pot.openChallenge(processId, challengerId, reason)
pot.closeChallenge(processId, closerId, resolution)
```

Code: `src/pot/challenge.ts`
