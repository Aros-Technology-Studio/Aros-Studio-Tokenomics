# Registration and authentication

## Admission condition

A node joins with:

1. **Verifiable identity** — X.509 / КЭП (or approved cert chain) + key pair;  
2. **Manual approval + allowlist** (v1);  
3. **No capital stake, deposit, or bond** as entry gate.

Sybil cost is identity and approval work, not seized funds.  
There is **nothing to slash** as a deposit.

## Registration flow

```text
1. Operator submits cert + public key + requested role(s)
2. Gate/allowlist review (human or role-based committee — product choice)
3. Decision appended to NodeChain as node_register / node_reject
4. On accept: node credentials activated for mTLS
```

## Authentication in operation

| Mechanism | Use |
|-----------|-----|
| mTLS | Node-to-node and node-to-core |
| Signed challenges | Prove key possession |
| JWT | Internal service tokens only (short-lived), not public end-user auth surface |

## Proof-of-origin (recommended)

Bind cert to a distinct operator identity so one party cannot cheaply mint unlimited unrelated nodes without review.

## Derived from prior material

Retained from paradigm NodeChain docs: identity-not-capital admission, signed causes naming their author, standing from work not holdings.  
Dropped: capital gates, stake slash.
