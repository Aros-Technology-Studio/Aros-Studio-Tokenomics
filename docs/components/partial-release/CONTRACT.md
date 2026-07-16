# CONTRACT — `partial-release`

**Status:** ready  

---

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| holder request | portal | yes |
| institutional approval | institution | yes |
| amount (≥ dust) | request | yes |
| claim/process refs | aroscoin | yes |

## Outputs

| Output | Destination |
|--------|-------------|
| new processId | orchestrator |
| burn/remint effects | aroscoin |
| child reserve records | reserve |
| ExecutionSnapshot + partialRelease | nodechain |

## Events

- `PartialReleaseRequested`  
- `PartialReleaseProcessStarted`  
- `PartialReleaseCompleted`  
- `PartialReleaseRejected`  

## Error paths

| Condition | Behavior |
|-----------|----------|
| no institutional approval | reject |
| amount < dust | reject |
| external attempt pre–Release Phase | reject |
| non-atomic partial failure | compensate within process rules (pre-verified steps only) |
