# ACCEPTANCE — `aroscoin`

**Status:** ready  

---

## Documentation ready when

- [x] ARO/9, processId+claimId, PoT-gated transfer  
- [x] Admin mint forbidden; burn+remint only reassignment  
- [x] NodeChain-before-ack; dual double-mint guard  
- [x] P0.4 answers canonical  

---

## Implementation ready when

- [ ] `src/aroscoin/` with ARO 9 decimals (arx)  
- [ ] Mint only via emission-after-PoT pipeline  
- [ ] Explicit absence/rejection of admin mint routes (tests)  
- [ ] Permissioned internal transfer tests (PoT required)  
- [ ] Split by amount + min dust config  
- [ ] Double-mint tests at TS layer; adapter interface expects Solidity guard  
- [ ] Burn+remint reassignment flow with new processId  
- [ ] Optional expiry hook  
- [ ] Integration: reserve lock + NodeChain before ack  
- [ ] Invariant asserts I2/I7/I8/I9 on write-paths  

---

## Explicit non-goals

- AST as valuation engine  
- ERC as canonical protocol  
- Admin mint  
- Pre-Release free market circulation  
- Claim reassignment without burn  

---

## Open items

| Item | Owner | Status |
|------|-------|--------|
| Default min dust value | owner | open (mechanism fixed) |
| Asset-policy schema for optional expiry | engineering | open |
