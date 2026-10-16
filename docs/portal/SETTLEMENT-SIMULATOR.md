# Settlement Simulator — specification

**Status:** Spec v0.5 — one framed window: topic cards → own data → Today or With AFC → one animation at a time → translucent result window; commercial scenarios 01–03 plus government scenarios G01–G12 (§12). Presentation only.
**Date:** 2026-10-09 · updated 2026-10-14
**Owner decisions captured:** 2026-10-09 (chat with product owner).
**Surface:** Public showcase (`docs/portal/PUBLIC-SHOWCASE-SITE.md`). UI language: English (other packs later).
**Page:** `/simulator` is a site page (`portal/frontend/app/simulator/page.tsx`, site navigation and animated background). The simulator is a self-contained static file, `portal/frontend/public/embed/settlement-simulator.html` (no backend calls), embedded through a same-origin frame (`components/ui/simulator-window.tsx`, `?embed=1`). The embedded content is **one fixed-size white window titled "Settlement Simulator"** on the site's background; every screen of the flow replaces the previous one inside that window, so the page never grows into a long scroll (§5). The embedded page reports its height to the frame. An *Open full screen* link opens the standalone version (page heading plus the same window). Linked from the TECHNOlogic hub (`/technologic`).

## 1. Purpose

A library of animated scenarios. Each scenario shows one institutional process in two states:

| State | Meaning |
|-------|---------|
| **Today** | How the process runs now, with every intermediary, hold and message. |
| **With AFC** | The same participants, connected through the AFC logical API layer (and AST where tokenization is involved). |

A **side-by-side** mode plays both states on one screen with a shared start.

The simulator is presentation only. It reads nothing from the AST core, mints nothing, and makes no performance claims (see §6).

## 2. Visual vocabulary (owner-approved)

| Object | Rendering |
|--------|-----------|
| Background | Pure white |
| Typeface | Open Sauce Sans (SIL OFL 1.1), embedded as WOFF/WOFF2 — not on Google Fonts; Helvetica/Arial fallback |
| Organization (bank, correspondent, anchor, AFC participant) | Transparent circle, thin black outline |
| Projection | 2.5D: flat shapes with soft ground shadows, slight float, stacked coins drawn with thickness |
| SWIFT message | White envelope with light-blue flap and outline |
| USD | Green coins |
| EUR | Blue coins |
| ArosCoin | Gold coins (internal AST unit: PoT fee / process unit only — never the settlement leg, Canon §III.7) |
| Any other ISO 4217 currency | Silver coins with the currency symbol and code on the face |
| KYC/AML check | Violet rotating ring inside the organization circle |
| Account check (Nostro/Loro, liquidity) | Blue rotating ring inside the organization circle |
| Hold | Padlock above the circle, labelled `HOLD` + amount |
| Completed check | Stamp card (double rule, issuer caption, `✓ …` lines) |
| Paper document | White sheet with folded corner and a caption (DEED, B/L, BATCH FILE…) |
| Asset token (RWA) | White hexagonal tile, black outline, `RWA` — proposed, pending owner approval |
| Goods | 2.5D kraft box |
| Check result | Green ✓ or red ✗ badge on the circle |

All world currencies are selectable (`Intl.supportedValuesOf('currency')`). Conversion is shown as coins re-minted in the converting institution (e.g. green → blue).

## 3. Node cycle (Today / correspondent chain)

Every institution in the chain runs the same cycle (owner-defined):

1. **Ingress** — a payment request (first node) or message (other nodes) arrives for a concrete amount.
2. **Hold** — funds are frozen (originator: client funds; correspondents: reserved liquidity). Padlock appears.
3. **Parallel checks** — violet ring: KYC/AML and sanctions; blue ring: correspondent account recalculation (Nostro/Loro), liquidity, FX where applicable.
4. **Stamp** — rings close, stamp card appears; the message carries one more stamp.
5. **Egress** — an envelope (MT103) leaves for the next node, burning the path. The next circle materializes when the envelope reaches it.

The beneficiary bank runs checks and stamps but holds nothing.

**Release:** an ACK pulse travels back `B → C2 → C1 → A`. Each padlock dissolves when the pulse passes its node (originator last). Funds then move along the chain; fees peel off at each intermediary; conversion happens at Correspondent 2.

## 4. Scenario 01 — Cross-border payment (SWIFT vs AFC)

Default corridor: **USD → EUR**, amount **1,000,000**. The viewer can change source currency, destination currency and amount.

### 4.1 Today (correspondent chain)

| # | Step | Simulated time (illustrative) |
|---|------|-------------------------------|
| 1 | Request arrives at Bank A (Originator) | 0 |
| 2 | Bank A: HOLD client funds | 0.2 h |
| 3 | Bank A: KYC/AML ∥ Nostro entry → stamp | 2 h |
| 4 | MT103 → Correspondent 1 materializes | 1 h |
| 5 | Correspondent 1: HOLD liquidity, sanctions ∥ Nostro/Loro rebalancing → stamp | 7 h |
| 6 | MT103 → Correspondent 2 materializes | 2 h |
| 7 | Correspondent 2: HOLD liquidity, AML ∥ Loro + FX quote → stamp | 10 h |
| 8 | MT103 → Bank B (Beneficiary) | 2 h |
| 9 | Bank B: beneficiary screening → stamp (no hold) | 8 h |
| 10 | ACK wave B → C2 → C1 → A, holds released in that order | 6 h |
| 11 | Settlement: coins A → C1 → C2 (convert) → B, fees peel off | 2 h |

Shown live: simulated clock, active holds (count and amount), liquidity locked (amount × hours), messages, fees + FX spread.

### 4.2 With AFC

Participants: **Anchor A**, **Correspondent (FX executor)**, **Anchor B**. Above them runs the **AFC protocol layer** (a thin bus). Above the bus sits a separate **NodeChain node (AST)**.

| # | Step |
|---|------|
| 1 | Request arrives at Anchor A |
| 2 | Anchor A completes its own KYC/AML and sanctions screening **before** calling AFC (compliance stays with the initiating institution) |
| 3 | API call with the cleared order rises from Anchor A to the AFC layer |
| 4 | One pass: each counterparty confirms its own account, liquidity and FX quote at the same time (rings flash together) |
| 5 | One combined confirmation, issuer caption "Confirmed by participants": contract terms, accounts & liquidity, FX quote |
| 6 | PoT: a gold **record signal** (not a coin) runs from the AFC layer to NodeChain; NodeChain records `verified = 1`; the AST fee is settled post-factum (Canon §III.2, §9.5) |
| 7 | Anchors settle on their own books: coins A → executor (convert) → B. No hold chain, no ACK wave |

### 4.3 Ontology rules (hard)

- AFC is a **logical process layer**. It holds no assets, no balances, no nodes and no custody core. It is never drawn holding coins.
- NodeChain and ArosCoin belong to **AST** and are drawn as a separate node above the AFC layer, never inside it.
- Anchors are the institutions that hold and move money. Conversion is executed by an anchor/executor, orchestrated by AFC.
- ArosCoin never carries the payment amount and no coin ever leaves the AFC layer; PoT is drawn as a record signal to NodeChain. (In scenario 02 the AST fee coin moves from the institution to AST, which may hold its own commissions, Canon §4.4.)
- The gold spark does not illustrate or claim token price growth (Canon §9.3: the internal value estimate is not a market price).

## 5. Controls

The whole flow lives in one framed window (owner request, 2026-10-14: "a frame on the page, titled Simulator; everything opens inside it, nothing long"). The window has a title bar (name, breadcrumb, *All topics*) and one screen at a time. Nothing plays until a route is chosen, and only the part that is playing is on screen.

1. **Topics** — square cards, grouped *Commercial* and *Government* (filter chips *All / Commercial / Government*). A card shows number, name and a one-line subtitle; a ✓ mark appears once Today or With AFC has been watched with the current details.
2. **Topic + your details** — title, short description, the two routes by name, and a form of the viewer's own details (`inputs` in the registry): at least the institution name (it labels that institution's circle and appears in captions), currency and amount, plus scenario-specific fields (number of beneficiaries, regions, milestones…). *Next →* sits in the bottom-right corner. Values are kept per scenario while the page is open; changing them clears earlier ✓ marks for that topic.
3. **Today or With AFC** — two large choices (with a small drawing each) and a line repeating the viewer's details.
4. **Play** — only the chosen route, fitted to the window: header with the clock, the animation, progress rail, caption, five live metrics, then *Pause/Play · Step · Restart · Speed (0.5×–4×) · Legend*. When the route ends, a *Continue →* button appears.
5. **Result window** — *Continue* opens a translucent window over the finished animation: **what happened** (the route's closing sentence), **why** (a short explanation, per route), and **results** (the route's metrics). Buttons: *Replay*, *Choose another topic*, and *Next: With AFC →* after Today (or *Next: how it runs today →* if With AFC was watched first). After the second route the window shows both routes **side by side** in one table. The × closes the window to look at the animation again; *Show result* reopens it.

Respects `prefers-reduced-motion`. Works at phone width (the window is taller than wide, the animation scrolls sideways inside it). A `#<key>` link opens a topic directly at step 2; `Esc` closes the result window and the legend; `Space` plays/pauses.

## 6. Numbers and claims policy

- Every timing, fee and FX rate is labelled **Illustrative**. They are examples, not quotes, SLAs or performance claims.
- The Today track depicts a **slow multi-hop corridor**. Public data: SWIFT reports most gpi payments reach the beneficiary bank fast (89% within an hour in 2023), while BIS/CPMI (2022) found slow routes can exceed two days. The footnote states this.
- With AFC / AST, timing is shown as the band "Seconds to minutes" (clock caption "target · PoT ≤ 15 min"), never a fixed figure. Canon §XII sets the PoT confirmation timeout at 15 minutes; the simulator must not promise faster finality than that.
- Fee placeholders (until a tariff is ratified): correspondent fee 25 USD each, beneficiary lifting fee 15 USD, FX spread 0.20% (same in both tracks, set by the converting institution). All shown as USD-equivalent.
- **Protocol (PoT) fee: no public amount** until a tariff is ratified. It follows Canon §9.4 (`fee = amount × feeRate`), but the Canon §XII sandbox rate is not a commercial tariff, and the market study (Notion, section 08) says not to fix a percentage before willingness-to-pay testing. The page shows "+ protocol fee" / "tariff TBD" instead of a number (since 2026-10-12).
- Owner note: at the sandbox rate the PoT fee on large tickets would exceed flat correspondent fees (1,500 vs ~65 USD on 1M); this is why no amount is shown publicly until the tariff is set.
- Illustrative FX rates are embedded for major currencies; for others the destination amount is shown as "at anchor rate".

## 7. Scenarios 02–04

> **Visibility (2026-10-16, owner decision):** letter of credit and bulk payouts are **removed** from the simulator; the tables below are history only. Asset tokenization stays **hidden** (`hidden: true`). Cross-border payment and the two-currency scenario are **hidden** until their With-AFC tracks are rewritten to the current model (§13).

Every scenario keeps the same rules: identical participants in both tracks where they exist in reality, illustrative clocks, and AFC/AST drawn without custody.

### 7.1 Scenario 02 — Asset tokenization (Today vs With AST)

| Today: notary, escrow, registry | With AST |
|---|---|
| Owner holds a signed institutional valuation | Same valuation; AST does not appraise (Canon §5.1) |
| Paper title pack → notary; identity and document checks; deed drafted | One digital package with QES → AST |
| Investor pays into notary escrow (HOLD) | Signature/document check (violet) ∥ PoT P1–P4 (blue) |
| Deed → title registry; title history and encumbrances; new owner registered | Stamp: QES verified · PoT `verified = 1` · recorded in NodeChain |
| Extract → notary; escrow released; owner paid; paper certificate to investor | Asset tokens minted at the institutional price (Canon §5.2); registry receives a "tokenized" mark (§5.3); AST fee in ArosCoin |
| | The owner transfers one token to the investor, who pays the owner directly, outside AST; NodeChain records the transfer of rights; AST holds no third-party funds (§4.4). Not labelled DvP: no linking mechanism is ratified |

### 7.2 Scenario 03 — Letter of credit (Today vs With AFC)

Participants in both tracks: issuing bank, advising bank, exporter, carrier. Voyage time excluded from both clocks.

| Today | With AFC |
|---|---|
| Importer's funds/credit line blocked (HOLD) | Same HOLD — the guarantee is real; only its duration changes |
| MT700 to advising bank; authentication | LC terms posted to AFC as a machine-readable contract |
| Paper LC notice to exporter | One pass: issuing bank, advising bank and exporter confirm terms |
| Paper bill of lading; courier to advising bank; examination (UCP 600 art. 14: up to 5 banking days) | Carrier posts the e-B/L event |
| Courier to issuing bank; second examination | Both banks check the data against the terms in one place; PoT + NodeChain record; fee in ArosCoin |
| Payment over correspondent network | Hold released; anchors settle on their own books |

### 7.3 Scenario 04 — Bulk payouts (Today vs With AFC)

Payroll batch of three payments to Banks X, Y, Z; Bank Z's account is closed in both tracks.

| Today | With AFC |
|---|---|
| Batch reserved (HOLD), validated, waits for the clearing window (overnight) | Batch submitted as one API call, any hour |
| Clearing house sorts and nets; employer debited; files and funds to X, Y, Z | One pass: each bank confirms its own account status |
| X and Y credit; Z rejects; return comes back days later | Z flagged before money moves; only X and Y are paid; PoT record |

## 8. Backlog

1. **Align the AFC tracks with the owner's portal text:** fiat → process-bound ArosCoin (AST mint) → fiat at a second anchor → external bank payout → AST burn; KYC/AML at the initiating institution before AFC; API Gateway + protocol validation inside AFC; 5–15 min shown as a target, not an SLA. Blocked on owner decisions: (a) naming — the canon gate forbids the terms used in the Notion text; (b) ArosCoin in the conversion route vs. the legal-review position.
2. **Scenarios from the owner's portal text:** last mile, digital-assets bridge, Nostro capital unlocking (liquidity on demand), new roads (tokenized bond via a neutral corridor), sovereign bond purchase; platform integrations shown only as proposed models, never as live partnerships.
3. Scenarios 03–04 (letter of credit, bulk payouts) are removed from the simulator (2026-10-16); decide whether to rework them later.

## 9. Acceptance

- [x] Owner approved scenario 01 direction (2026-10-09: "not bad, polish it").
- [ ] Owner approves scenarios 02–04 and the asset-token glyph.
- [ ] AFC/AST fee tariff ratified (replaces the sandbox fee rate in the simulator).
- [ ] Legal review of on-screen copy (`afc-legal-review`).
- [x] On the portal at `/simulator`, linked from `/technologic` (2026-10-12).
- [x] Deployed to production 2026-10-12 (owner ran §10 on the droplet; `/simulator` and `/technologic` return HTTP 200 through Caddy).

## 10. Deployment (production droplet)

Production runs `docker-compose.prod.yml` from **`/opt/ast-portal`** on the droplet `Aros-Studio-Portal`, behind Caddy (`deploy/Caddyfile.portal`, `portal.arosfinancialcore.com → 127.0.0.1:3200`). **`/opt/ast-portal` is a plain copy, not a git checkout**, so `git pull` does not work there. The page ships inside the `portal-ui` image (`COPY public`), so a site release replaces `portal/frontend` and rebuilds that one service. Run in the DigitalOcean Droplet Console (Droplets → droplet → Access → Launch Droplet Console), in one console window:

```bash
# 1. Download the release branch and list server-only files (no changes yet)
cd /opt/ast-portal || exit
STAMP=$(date +%Y%m%d-%H%M%S); echo "$STAMP"
rm -rf /tmp/ast-new && mkdir -p /tmp/ast-new
curl -fsSL "https://codeload.github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/tar.gz/refs/heads/<release-branch>" | tar -xz -C /tmp/ast-new --strip-components=1
diff -rq portal/frontend /tmp/ast-new/portal/frontend | grep "^Only in portal/frontend" | grep -v node_modules   # must be empty, else stop

# 2. Back up, replace, rebuild only portal-ui
cp -a portal/frontend "portal/frontend.bak-$STAMP"
rm -rf portal/frontend && cp -a /tmp/ast-new/portal/frontend portal/frontend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --no-deps portal-ui

# 3. Check
curl -sI https://portal.arosfinancialcore.com/simulator | head -1   # expect 200
```

`--no-deps` is required: without it Compose also rebuilds and recreates `portal-edge` and `core` (journal SoT) through `depends_on`. `.env.production` lives in `/opt/ast-portal`; its `:?` variables must be set even for a single-service release.

Rollback (same window): `rm -rf portal/frontend && mv "portal/frontend.bak-$STAMP" portal/frontend`, then the same `up -d --build --no-deps portal-ui`.

Follow-up for ops: turn `/opt/ast-portal` into a git checkout (or deploy images from CI) so releases are traceable to a commit; the droplet also reported pending OS updates and "System restart required" (2026-10-12) — schedule separately.

## 11. Visual polish (2026-10-12, owner request)

Check cards are level diagram callouts (no tilt), with a hairline under the issuer, check badges, a pointer toward their node, and a neon-green glow once the check has passed; failed checks glow red. The landing-page hero shift was scoped to the home page and capped so content never leaves the screen (it had pushed `/technologic` and narrow screens off the left edge).

## 12. Government scenarios (G01–G12)

Source: owner's research in Notion, "04 — Государственный пакет AFC/AST" (12 state scenarios with buyer, effect and main risk; reference procurement flow) and "03 — Сегменты аудитории и сквозные финансовые процессы" (sections E and F). Each scenario follows §4.3 and §6 plus these state-specific rules: the state keeps law, money and decisions; eligibility, assessment, clearance and inspections are done by the responsible authority on its own data; nobody is denied automatically (human review / appeal path); evidence that releases money is signed by an independent verifier; disputes put the process on hold; after external finality only compensation, never erasure; CBDC stays a central-bank liability and bond title stays with the registry/CSD; AFC never claims cross-system atomicity, sanctions circumvention or replacement of national infrastructure.

| No | Scenario | Buyer | Effect | Main risk |
|----|----------|-------|--------|-----------|
| G01 | Targeted benefits | Ministry of Finance / social protection | Less leakage | Eligibility errors, discrimination |
| G02 | Government procurement | Treasury | Milestone-linked payment | Oracle quality, corruption |
| G03 | Taxes and refunds | Tax authority / treasury | Fast reconciliation | Erroneous automation |
| G04 | Customs | Customs / banks | Duty and payment in sync | Trade-data secrecy |
| G05 | Intergovernmental transfers | Ministry of Finance / regions | Traceability | Politicised conditions |
| G06 | Disaster relief | Government / donors | Fast targeted payouts | Identity exclusion |
| G07 | Aid and grants | IFIs / ministries | Impact evidence | Privacy, local capacity |
| G08 | CBDC ↔ deposits | Central bank / banks | Interoperability | Monetary and legal finality |
| G09 | Tokenised sovereign bonds | Debt office / CSD | DvP coordination and reporting | Securities law |
| G10 | Carbon / energy subsidy | Ministries | Evidence-linked finance | Data / oracle quality |
| G11 | State-owned enterprise treasury | Holdings / banks | Liquidity visibility | Concentration |
| G12 | Cross-border trade corridor | Central banks / customs / banks | Faster compliant settlement | Sanctions, geopolitics |

Per-scenario step tables follow (§12.1–12.12).

## 13. Main scenario — Fiat to a crypto wallet (2026-10-16)

Key `fc`. Any institution sends an amount to one crypto wallet, delivered in the crypto asset the request names (example: USD 1,000,000 delivered as BTC).

**Today (no AFC).** Real path, step by step, 40 steps: the sending bank checks the customer and authorises a card payment to an exchange (holds the authorisation); the client opens an exchange account, passes KYC tiers; the exchange's backend (card and bank rails, liquidity, custody ledger, withdrawals) buys the crypto and credits a custody balance; the withdrawal to the wallet goes through the travel-rule check; the exchange broadcasts the transfer; the blockchain confirms it; the card settles one or more days later. Holds and messages are shown on each hop.

**With AFC.** Five steps: (1) the request, with an already confirmed transaction, arrives through the API gateway and LacMusa routes it to the fiat anchor; (2) the fiat anchor accepts the funds on its reserve account; (3) after acceptance, LacMusa instructs AST, the proof of transaction is recorded and ArosCoin is issued 1 = 1; (4) the crypto anchor accepts ArosCoin and converts it into the requested crypto (only because the request names one); (5) the crypto is issued to the wallet and the process ends.

Model rules for the With-AFC track: LacMusa is a supra-architectural control layer inside the AFC space, drawn as a layer rather than as a link (the main scenario does not draw it yet). Anchors accept money on reserve accounts and never accept requests. No holds on the With-AFC track. No token exists before acceptance.

**Timing.** The band "Seconds to minutes (target · PoT ≤ 15 min)" describes the whole transaction, from the initiating institution to the receiving side, including the checks each side performs before it accepts. It is not AFC's processing time alone.
