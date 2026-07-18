# Confirmer attestations

Confirmers do not merely list ids — they **sign** a domain-separated digest.

## Digest (`AST-POT-ATTEST-v1`)

Canonical JSON fields (sorted):

- processId, processType  
- tipHash, tipHeight  
- stagesCompleted (sorted)  
- institutionAllowlisted, hasDocuments, hasQualifiedSignature  

`attestationDigest = SHA-256(canonicalJson(...))`

## Signature

- Algorithm: **ed25519**  
- Signed material: attestationDigest hex (as content hash bytes)  
- Verified via KeyRegistry public keys  

## Quorum

Only **valid** attestations from **eligible** validators count toward Q.

## Code

`src/pot/attestation.ts`
