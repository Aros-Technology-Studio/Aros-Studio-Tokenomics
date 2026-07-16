# CONTRACT — `nodes`

**Status:** ready  

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| registration package | institution | yes | cert + keys + allowlist check |
| auth handshake | node | yes | mTLS + signed challenge |
| heartbeat | node | yes | periodic |
| task assignment request | orchestrator | yes | role-gated |
| suspend signal | policy / reputation engine | no | grace period |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| node credentials / session | node | not JWT-primary at edge |
| validator set / eligibility | pot | M-of-N input |
| reputation / uptime | settlement weights | with commission |
| assignment | executor nodes | task API |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `NodeRegistered` | out | after manual approval |
| `NodeAuthenticated` | out | successful challenge |
| `NodeHeartbeat` | out | liveness |
| `NodeSuspended` | out | quorum exclusion |
| `NodeRestored` | out | back to active quorum eligibility |

---

## API surface (v1 minimum)

- `POST /node/register`  
- `POST /node/auth`  
- heartbeat endpoint  
- task assignment endpoint  

---

## Dependencies

| Depends on | Why |
|------------|-----|
| PKI / cert validation | institutional identity |
| config | geo, uptime thresholds, allowlist |

| Depended on by | Why |
|----------------|-----|
| `pot` | validators |
| `commission` | payees |
| `orchestrator` | assignment |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| not allowlisted / not approved | reject registration |
| auth fail | reject |
| heartbeat timeout / uptime < min | suspend from quorum |
| jurisdiction mismatch | reject |
