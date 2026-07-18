# Validator registry

`ValidatorRegistry` tracks confirmer eligibility:

- `register` / `suspend` / `restore`  
- Active only for quorum eligibility  
- No stake  

If registry is empty at first verify, proposed `validatorIds` are auto-registered (bootstrap). Production should pre-register validators.

Code: `src/pot/validator-registry.ts`
