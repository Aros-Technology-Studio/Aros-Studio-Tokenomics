# Evidence schema

Evidence is the **recorded justification** for a verdict. It is journaled as `pot_evidence` before or with the verdict.

## Fields (v1)

| Field | Type | Required |
|-------|------|----------|
| processId | string | yes |
| processType | string | yes |
| schemaVersion | string | yes (`pot-evidence-1`) |
| institutionAllowlisted | bool | yes |
| hasDocuments | bool | yes |
| hasQualifiedSignature | bool | yes |
| stagesCompleted | string[] | yes |
| requiredStages | string[] | yes |
| journalHeights | number[] | yes (heights of process records used) |
| processOpenHeight | number \| null | yes |
| tipHeight | number | yes |
| tipHash | string | yes |
| validatorIds | string[] | yes |
| confirmers | string[] | yes |
| openedAtUtc | string \| null | yes (for timeout) |
| evaluatedAtUtc | string | yes |
| criteriaResult | {P1,P2,P3,P4} | filled at evaluate |
| reasonCodes | string[] | filled at evaluate |

## Rules

- No fee amounts or mint amounts in evidence.  
- Snapshot/tip hashes bind evaluation to a journal state.  
