# ACCEPTANCE — `<component-name>`

**Status:** draft | ready  

Done criteria for this component’s **documentation** and later **implementation**.  
This is a readiness list — not a compliance or policing checklist.

---

## Documentation ready when

- [ ] PURPOSE states clear boundary and anti-scope  
- [ ] MODEL entities, lifecycle, and invariants align with `CANON.md`  
- [ ] CONTRACT inputs/outputs/events are implementable without guessing  
- [ ] Open items (if any) are listed below; closed canon questions are not reopened  

---

## Implementation ready when

- [ ] Code lives under `src/<component-name>/` (NestJS/TypeScript per stack)  
- [ ] Unit tests cover happy path and invariant-preserving failures  
- [ ] Integration with named dependencies matches CONTRACT  
- [ ] No initiation of mint/burn/payment from oversight-only components  

---

## Explicit non-goals

- No deposit/slashing/punishment mechanics unless already ratified in canon  
- No language or APIs that imply patrol, sanction, or forced compliance  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| … | … | open / closed (cite CANON) |
