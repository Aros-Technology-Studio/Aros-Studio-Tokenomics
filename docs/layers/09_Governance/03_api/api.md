# Governance API (in-process)

**Code:** `src/governance/governance.service.ts`  
**HTTP:** no dedicated public REST controller in v1 — called from Orchestrator / TokenizationPipeline.  
Core may expose process paths that pass `requireL2` / `requireL3` flags.

## L1

```text
evaluateL1({
  processId,
  hasDocuments,
  hasQualifiedSignature,
  institutionAllowlisted
}) → { pass, reasonCodes, level: 'L1' }
```

Reason codes: `L1_INSTITUTION_NOT_ALLOWLISTED` | `L1_DOCUMENTS_MISSING` | `L1_SIGNATURE_MISSING`.

## L2

```text
openL2(subjectId, required, role?)     # alias openApproval
grantL2(subjectId, approverId) → { complete, count, required }  # alias grant → boolean complete
isL2Complete(subjectId) → boolean
```

## L3

```text
evaluateL3({
  processId, valuation, potVerified,
  institutionAllowlisted, stagesCompleted,
  allSeeingEyeCriticalCount, highValue?
}) → L3Result & { level: 'L3' }
```

Panel: five agents (policy default; optional LLM via `AST_L3_USE_LLM`).

## Journal

```text
recordParamChange(processId|null, key, value)
recordGovernanceEvent(processId|null, kind, payload)
```

Appends `param_change` with `writerRole: governance`. **Does not mint.**
