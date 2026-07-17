# Admission and standing

## Standing

A node’s **standing** is a deterministic function of the journal (and agreed metrics derived from it), for example:

- successful confirmations / appends participated;  
- timeouts and invalid signature events;  
- uptime factor (ops metric, recorded or mirrored).

Standing may affect:

- eligibility to co-sign appends;  
- load scheduling;  
- suspension thresholds.

Standing **does not** mint tokens and **does not** replace PoT.

## New nodes

Fresh identities start at minimum standing and earn higher standing by recorded good work — work first, influence second.

## No holdings weight

ARO balance never increases standing or write rights.
