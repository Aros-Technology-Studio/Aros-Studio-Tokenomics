# Owner start alone (D1)

**Goal:** You start AST on this Mac **without chat help**.  
**One command** after the repo is on disk.

---

## Every time (start)

```bash
cd /Users/ketevanarevadze/Aros-Studio-Tokenomics
bash scripts/home-up.sh
# or: npm run home:up
```

Wait until you see **AST home stack — READY**.

| Open | URL |
|------|-----|
| UI | http://127.0.0.1:3200 |
| Login | http://127.0.0.1:3200/login |
| Wizard | http://127.0.0.1:3200/tokenization |
| NodeChain | http://127.0.0.1:3200/nodechain |

**Login (local demo):**

| Field | Value |
|-------|--------|
| Login | `pilot` |
| Salt | `pilot` |

Alternative: Institution `DEMO` · Token `demo-institution-token`.

Same card is written to: `.home-run/READY.txt`

---

## Stop

```bash
bash scripts/home-down.sh
# or: npm run home:down
```

---

## First time on a new Mac only

1. Install **Node.js 20+** (https://nodejs.org or `brew install node@20`).  
2. Clone or copy this repo.  
3. Open Terminal, `cd` into the repo folder.  
4. Run `bash scripts/home-up.sh` (first run installs deps — may take several minutes).

No domain required for local use.

---

## If something fails

1. `bash scripts/home-down.sh`  
2. Read the last lines:

```bash
tail -40 .home-run/core.log
tail -40 .home-run/edge.log
tail -40 .home-run/ui.log
```

3. Common fixes:
   - Port busy → home-down frees 3000/3100/3200  
   - Old Node → upgrade to Node 20+  
   - `npm ci` errors → network; retry  

4. Run `bash scripts/home-up.sh` again.

---

## Optional public URL

```bash
# stack must already be up
bash scripts/home-tunnel.sh
cat .home-run/public-url.txt
```

Full house/LAN/tunnel notes: [`HOME-ACCESS.md`](HOME-ACCESS.md).

---

## Acceptance (D1)

| Check | Done when |
|-------|-----------|
| Owner runs only `home-up` / `home-down` | No chat for start/stop |
| Browser opens UI + login works | pilot / pilot or DEMO |
| READY card printed + saved | `.home-run/READY.txt` |

**Not** D1: real institution PDF demo (D2), production domain (D6/D8).
