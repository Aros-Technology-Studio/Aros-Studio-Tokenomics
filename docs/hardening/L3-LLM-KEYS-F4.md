# F4 — Live multi-vendor LLM keys (optional L3)

**Status:** Optional · adapters exist · live keys = secrets residual  
**Code:** `src/governance/llm-adapters.ts` · `l3-agents.ts`

## Env (do not commit secrets)

| Variable | Role |
|----------|------|
| `AST_L3_USE_LLM` | `1` enable five-agent LLM/mock panel |
| `AST_L3_LLM_PROVIDER` | `mock` \| `openai_compatible` |
| `AST_L3_LLM_BASE_URL` | OpenAI-compatible base |
| `AST_L3_LLM_API_KEY` | API key from **secrets store** |
| `AST_L3_LLM_MODEL` | model id |
| `AST_L3_HTTP_<AGENT>` | per-agent HTTP backend URL |

## Secrets store pattern (prod)

```bash
# Example: inject from vault at process start — never git
export AST_L3_USE_LLM=1
export AST_L3_LLM_PROVIDER=openai_compatible
export AST_L3_LLM_API_KEY="$(vault kv get -field=api_key secret/ast/l3-openai)"
export AST_L3_LLM_BASE_URL=https://api.openai.com/v1
```

Multi-vendor: set different `AST_L3_HTTP_*` URLs per agent role, or rotate provider via `AST_L3_LLM_PROVIDER`.

## Acceptance

| Check | Status |
|-------|--------|
| Mock/OpenAI-compatible adapters | ✅ |
| Env documented | ✅ |
| Live keys in vault + multi-vendor contracts | **Owner residual** |

Default for pilots: `AST_L3_USE_LLM` off or `mock` only.
