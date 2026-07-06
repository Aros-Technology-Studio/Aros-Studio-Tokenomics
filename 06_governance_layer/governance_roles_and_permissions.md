# governance_roles_and_permissions.md

**Stands on:** I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment for confirmed work), I5 (determinism), I6 (no speculative surface), I7 (Eye: observe and veto), I8 (append-only causality). See `README.md` §1.

## 1. Purpose

Enumerate the concrete oversight roles and, for each, its **exact, bounded set of permissions**. The enumeration is exhaustive: a role may do what is listed and nothing else, because a permission not derivable from an invariant does not exist here. The document ends with the explicit closure that **no role mints, burns, or pays.**

---

## 2. Roles are bound to identities, not to holdings

Every oversight role is bound to a **service identity** (mutual-TLS, service-to-service; AST has no end-user auth surface), recorded in NodeChain. A role is never bound to an ARO balance, because I6 leaves *governance-by-holding* with no object: a held balance is retained payment for past confirmed work (I3), not a seat and not a ballot. *Therefore* there is no "voter," no "proposal author with a stake," and no "delegate" — those roles presuppose a franchise the model does not contain.

There are exactly four roles. Three are committees with a single bounded remit each; the fourth is the apex Eye.

---

## 3. The role table

| Role | Identity | Its bounded remit | Stands on |
|---|---|---|---|
| **All-Seeing Eye** | apex observer identity | Observe every step; **veto** any step that would violate I1–I6. Initiates nothing. | I7, I8 |
| **Parameter Committee** | oversight identity | Set `COMMISSION_RATE` to a value **within `rateBounds = [0, 0.01]`**. | I5 |
| **Role Committee** | oversight identity | **Assign / rotate** oversight roles across identities, recorded before effect. | I8 |
| **Integrity Committee** | oversight identity | **Flag** a suspected invariant breach and escalate it to the Eye. | I5, I8 |

No role appears twice, and no committee holds the Eye's veto. Each remit is one line because each stands on one invariant.

---

## 4. Permission matrix (enumerated and closed)

Every cell is either an explicit permission or an explicit *no object*. A blank would be ambiguous, so there are none.

| Action | All-Seeing Eye | Parameter Committee | Role Committee | Integrity Committee | Derivation |
|---|---|---|---|---|---|
| Observe any recorded cause | ✅ | ✅ (own remit) | ✅ (own remit) | ✅ | I8 |
| Veto (withhold acknowledgement) | ✅ | ❌ | ❌ | ❌ | I7 — veto is apex-only |
| Flag a suspected breach | ✅ | ✅ | ✅ | ✅ (primary remit) | I5, I8 |
| Set `COMMISSION_RATE` within bounds | ❌ (Eye initiates nothing) | ✅ | ❌ | ❌ | I5 |
| Assign / rotate an oversight role | ❌ | ❌ | ✅ | ❌ | I8 |
| Mint a unit | ❌ | ❌ | ❌ | ❌ | **no object — I1** |
| Burn a unit | ❌ | ❌ | ❌ | ❌ | **no object — I2** |
| Pay a node | ❌ | ❌ | ❌ | ❌ | **no object — I3** |
| Change `DECIMALS` / `SYMBOL` / split | ❌ | ❌ | ❌ | ❌ | **no object — I1, I5** |
| Derive authority from an ARO holding | ❌ | ❌ | ❌ | ❌ | **no object — I6** |

The three columns of `❌` for mint/burn/pay are the heart of the layer: *no role has a generative primitive.* See §7.

---

## 5. Permission grant and rotation

The Role Committee is the only issuer of role assignments, and its own act is bounded and recorded.

- **Grant / rotate.** Binding a role to an identity, or moving it to another, is appended as `governance.roleSet { role, from, to, at }` **before it takes effect** (I8). The new binding is in force only because its record already exists.
- **Bounded to the enumerated remits.** A `roleSet` may bind only one of the four roles in §3 to an identity. It cannot invent a new remit or widen an existing one, because a role with undefined authority would make outcomes non-reproducible, contradicting I5. The remit set is fixed by this document and is *not* a governable parameter.
- **Observed and vetoable.** The Eye observes every `roleSet` in the pre-acknowledgement window and vetoes any that would violate an invariant — e.g. attempting to grant a committee the veto, which would duplicate the apex and break the single-observer discipline of I7.
- **Reproducible.** Replaying the `roleSet` records yields exactly the role state in force (I5). There is no out-of-band grant.

There is no time-lock-by-stake, no supermajority, and no quorum on a grant, because those are properties of a voting body (I6 leaves it no object); the grant is instead a single recorded, bounded, vetoable act (`governance_layer_overview.md` §7).

---

## 6. Escalation constraints

No committee can widen its own authority.

- A committee cannot promote itself into the Eye's seat: the veto is apex-only (I7) and cannot be assigned to a committee (§5).
- A committee cannot acquire a second remit: `roleSet` binds one enumerated role, and remits are fixed (§5).
- A committee's only upward act is to **flag** (`ai_oversight_hierarchy.md` §4), which is an observation, not a seizure of power.

*Because* every path to more authority would require either an unbounded `roleSet` (rejected by I5) or a self-granted veto (rejected by I7), there is no reachable state in which a committee escalates itself. This replaces the old idea of "instant takeover" defences with a structural impossibility.

---

## 7. Closure: no role mints, burns, or pays

State it plainly and derive it, because it is the whole point of the permission model.

- **No role mints (I1).** A unit exists only as the consequence of a PoT verdict `verified === 1`. No role holds a PoT verdict as an output; a role decision is not a verdict. *Therefore* no role is a cause of a unit, and none has a minting primitive.
- **No role burns (I2).** The process part is burned atomically by the cycle that minted it. No role closes a process cycle; *therefore* none has a burning primitive.
- **No role pays (I3).** A node is paid only for PoT-confirmed work, post-factum. A role decision is not confirmed work; *therefore* none causes a payment.
- **No role sets an economic axiom (I1, I5).** `DECIMALS`, `SYMBOL`, `BASE_UNIT`, and the `NODE_SHARE`/`RESERVE_SHARE` split are fixed; changing them would change the axioms, not a parameter, and no role has standing to do so.

What every role *can* do reduces to: observe, flag, set one bounded parameter, assign one bounded role, or (apex only) veto. None of these creates, destroys, or pays value.

---

## 8. Next

- `parameter_governance.md` — the deterministic, bounded, auditable procedure by which the Parameter Committee sets `COMMISSION_RATE`, recorded before effect.
