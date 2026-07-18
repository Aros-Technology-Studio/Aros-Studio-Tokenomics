# PoT test plan

## Suites (`src/pot/`)

| File | Focus |
|------|--------|
| `criteria.spec.ts` | P1–P4 pass/fail |
| `quorum.spec.ts` | M-of-N, K min |
| `attestation.spec.ts` | sign/verify digest |
| `timeout.spec.ts` | 15m window |
| `validator-registry.spec.ts` | active/suspended eligibility |
| `process-types.spec.ts` | stage catalog |
| `pot.service.spec.ts` | verify, challenge, timeout, double, keys |

## Critical cases

1. Happy path: attestations + evidence before verdict + ok-to-emit  
2. Challenge open → verified=0  
3. Challenge closed → verified=1  
4. Suspended validator shrinks K → quorum fail  
5. Invalid attestation signatures → no confirmers  
6. Timeout → expired  
7. Second final verify → throw  
8. `keys` missing → throw  

## Integration

- `tokenization.pipeline.spec.ts` / orchestrator — mint only after verified=1 with KeyRegistry  
