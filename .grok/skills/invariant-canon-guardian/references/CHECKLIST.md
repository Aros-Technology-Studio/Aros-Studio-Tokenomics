# Quick canon checklist (AST)

## SoT

- [ ] Change aligns with `docs/AST-CORE-CANON.md`  
- [ ] Decisions in `docs/P0-P4-TECHNICAL-DECISIONS.md` not contradicted  
- [ ] Component pack under `docs/components/` respected if exists  

## Gates

- [ ] `npm run check:canon` green  
- [ ] Migration candidates: `npm run check:migration` green  

## Never as live features

- [ ] No Eye veto/rollback/mint/burn/pay  
- [ ] No admin/god mint  
- [ ] No PoT/NodeChain bypass  
- [ ] No third-party custody  
- [ ] No free emission / mint without process  
- [ ] No ERC-as-canonical protocol  
- [ ] No AST self-appraisal of assets  

## I1–I9

- [ ] I1 PoT-gated value  
- [ ] I2 process-bound mint/burn  
- [ ] I3 NodeChain for significant events  
- [ ] I4 determinism  
- [ ] I5 no speculative holding product  
- [ ] I6 own funds only  
- [ ] I7 confirmed value reflection  
- [ ] I8 pre-Release external block  
- [ ] I9 pro-rata new emission when applicable  

## PoT

- [ ] P1–P4 all required  
- [ ] Write-ahead NodeChain before economic effect of verified  
