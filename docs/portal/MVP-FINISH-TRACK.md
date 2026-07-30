# Portal + AST MVP — finish track

**Status:** Working MVP core + institutional edge. Polish and harden in order.  
**Positioning:** AST is an institutional **tool** (not a competing market player). Outer product shells build on AST later.

## Already in place

| Area | What works |
|------|------------|
| NodeChain SoT | Journal, genesis, verify, HTTP, explorer UI |
| PoT-gated mint | ok-to-emit, no free mint |
| ARO internal unit | mint/burn/transfer/reval + hydrate |
| Commission 70/30 + reserve | post-factum path |
| Portal edge | login, document-first wizard, e-sign attestation, start, certificate |
| Home stack | `bash scripts/home-up.sh` / `home-down.sh` |

## Local open (always)

```bash
cd /path/to/Aros-Studio-Tokenomics
bash scripts/home-up.sh
```

| Step | URL / value |
|------|-------------|
| UI | http://127.0.0.1:3200 |
| Login | http://127.0.0.1:3200/login |
| Wizard | http://127.0.0.1:3200/tokenization |
| Institution | `DEMO` |
| Token | `demo-institution-token` |
| Stop | `bash scripts/home-down.sh` |

**Wizard order (document-first):** Document → E-signature → Fields from document → Start → Certificate.

## Finish track (ordered)

Do **one slice at a time**. Do not mark Done without real acceptance.

### Track A — Operator reliability

1. [x] `home-up.sh` waits for health + prints DEMO login  
2. [x] Health banner on login (edge / Core)  
3. [x] Persist edge process store (`AST_EDGE_STORE_PATH` / `data/edge-processes.json`)

### Track B — Document package depth

1. [x] Document-first UX  
2. [x] Multi-file package (title + valuation annex)  
3. [x] PDF / text extract assist (`POST /v1/documents/extract`, human confirms)  
4. [ ] Later: real QES/X.509 chain for national e-seal  
5. [ ] OCR for image-only scans

### Track C — Status & certificate

1. [x] Certificate download/print  
2. [x] Poll status until mint/PoT visible  
3. [x] Link to NodeChain UI (`/nodechain?processId=…`)  
4. [x] Retry Core hand-off (`POST …/retry-handoff`)

### Track D — Pilot institution (not DEMO)

1. [x] Example env: `portal/.env.example`  
2. [x] `AST_INSTITUTION_SECRETS_FILE` + `scripts/setup-institution-secrets.sh`  
3. [x] `home-up` auto-loads `data/institution-secrets.json`  
4. [x] Docs: `docs/portal/INSTITUTION-SECRETS.md`  
5. [ ] Owner rotates token if shared; TLS / domain when ready

### Track E — Outer product shell (later)

AST is the main economic link. Any outer product surface wraps AST — **after** AST pilot path is stable. Not freelanced ahead of specs.

## Explicit out of scope for this finish track

- Public market listing of ARO  
- Competing with banks/registries  
- Full multi-node mainnet consensus  
- Eye veto (canon: observe only)

## Acceptance for “MVP finished enough for pilot demo”

- [x] Document-first submit path  
- [x] E-sign attestation gate  
- [x] Core hand-off when Core up  
- [x] Digitization certificate  
- [ ] Owner can start stack alone (`home-up`) without chat help  
- [ ] One real PDF package demo end-to-end (owner file)  
- [ ] Demo script / checklist owner signs off  

## Source of truth

- `docs/AST-CORE-CANON.md`  
- `docs/portal/PUBLIC-SITE.md`  
- Layer docs under `docs/layers/`  
