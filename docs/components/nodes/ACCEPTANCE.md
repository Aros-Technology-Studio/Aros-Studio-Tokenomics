# ACCEPTANCE — `nodes`

**Status:** ready  

---

## Documentation ready when

- [x] Dual identity, mTLS+challenge, fixed roles  
- [x] Suspend without slashing  
- [x] Multi-node per institution  
- [x] P1.6 answers canonical  

---

## Implementation ready when

- [ ] Register with manual approval + allowlist  
- [ ] mTLS + signed challenges; JWT internal-only  
- [ ] Roles enum fixed  
- [ ] Heartbeat + default 95% uptime gate  
- [ ] Reputation suspend + grace + quorum exclusion  
- [ ] Configurable geo/jurisdiction  
- [ ] Task assignment API  
- [ ] Multi-node under one institutional cert  
- [ ] Tests for unapproved confirm attempts  

---

## Explicit non-goals

- Open registration  
- Slashing  
- JWT as primary node edge auth  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Grace period duration default | owner | open |
| Reputation formula details | engineering | open (behavior fixed) |
