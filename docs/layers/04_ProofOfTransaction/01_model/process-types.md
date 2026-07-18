# Process-type stage catalog

PoT **P2** requires process-type–specific stages to be complete. **P4** uses process-type flags for documents, signature, valuation, holder.

## Catalog

| processType | requiredStages | docs | КЭП | valuation | holder |
|-------------|----------------|------|-----|-----------|--------|
| primary_tokenization | opened, documents, encoded | ✓ | ✓ | ✓ | ✓ |
| revaluation | opened, documents, encoded | ✓ | ✓ | ✓ | — |
| ownership_transfer | opened, documents, encoded | ✓ | ✓ | — | ✓ |
| partial_release | opened, documents, encoded | ✓ | ✓ | ✓ | ✓ |

Unknown process types inherit **strict defaults** (all requirements true).

## Stage names (processing layer)

`opened` → `documents` → `encoded` → `awaiting_pot` → `pot_done` → `settled` → `closed` | `aborted`

PoT only requires the prefix stages that prove the process was opened, documented, and encoded before confirmation.

Code: `src/pot/process-types.ts` — `getProcessTypeRule`, `STAGE_CATALOG`, `requiredStagesFor`
