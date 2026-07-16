# Process: Primary tokenization

**Canon:** CANON §§V–VI, orchestrator pipeline  
**Entry:** Institutional Portal → Orchestrator only

## Steps

1. StartProcess (`processId`, `idempotencyKey`)  
2. Document + qualified e-signature validation  
3. Oracle Gateway (optional)  
4. PoT Evaluation (P1–P4 all pass → `verified = 1`)  
5. NodeChain record (write-ahead)  
6. Emission (institutional valuation + ΔValue; pro-rata I9)  
7. Settlement (commission on PoT)  
8. State update + notification  
9. EndProcess  

## Rules

- AST does not appraise assets.  
- No completion without PoT + NodeChain.  
- Compensation only before `verified = 1`.  
