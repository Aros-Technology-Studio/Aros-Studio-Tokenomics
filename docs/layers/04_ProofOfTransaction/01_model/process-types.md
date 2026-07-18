# Process-type rules

Catalog in `src/pot/process-types.ts`:

| processType | required stages | docs | КЭП | valuation | holder |
|-------------|-----------------|------|-----|-----------|--------|
| primary_tokenization | opened, documents, encoded | yes | yes | yes | yes |
| revaluation | opened, documents, encoded | yes | yes | yes | no |
| ownership_transfer | opened, documents, encoded | yes | yes | no | yes |

Unknown types default to strict primary-tokenization rules (fail-closed).
