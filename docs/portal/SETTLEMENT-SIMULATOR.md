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

## 12. Government scenarios (G01–G12) — Rebuilt on the current model, 2026-10-16

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

### 12.1 G01 — Targeted benefits

*Steps*

| # | Today (38 steps, hours) | With AFC (5 steps, hours) |
|---|-------------------------|----------------------------|
| 1 | The ministry opens this month’s support run: budget, people covered, people shown | Request. Each institution has checked its own data; two records are flagged for review. The signed list and payment come through the gateway; AFC routes them to the source anchor |
| 2 | The ministry sends the treasury a signed paper spending request | Accept. The treasury’s funds for the cleared payments only are accepted on the source anchor’s reserve |
| 3 | The treasury checks the appropriation, the budget line and the monthly ceiling | Issue. After acceptance, AFC instructs NodeChain. The proof of transaction is recorded and ArosCoin is issued 1 = 1 |
| 4 | The treasury signs a release order (sometimes wet-ink; several working days, illustrative) | Accept. The payout anchor accepts ArosCoin; AFC checks that its reserve covers the same amount |
| 5 | The cash manager confirms the cash at the central bank for the transfer | Output. The bank credits each cleared person on its own books; notices leave through the gateway; the process ends |
| 6 | In this example the whole budget is pre-funded to the bank’s programme account (one pattern, not the only one) | |
| 7 | The money waits at the bank as a float: it has left the treasury, but no one has been paid from it (real hold) | |
| 8 | The bank posts the float to its programme account | |
| 9 | Caseworkers check each file on the registry: income, household size, address; some files are retyped from paper | |
| 10 | In this example, two spreadsheets are merged by hand; the same person is listed twice | |
| 11 | A second clerk checks the list against the sign-off sheet, page by page (four-eyes rule) | |
| 12 | The ministry signs off the list; the bank has not seen it yet | |
| 13 | The list goes to the bank as a file export, uploaded by a clerk; the duplicate goes with it | |
| 14 | The bank matches every name and ID to an account in an overnight batch | |
| 15 | Branch staff print the exceptions and re-key corrections by hand; the file is run again the next business day | |
| 16 | One name does not match its account and is rejected; the duplicate passes both times | |
| 17 | The rejected record goes back to the ministry by e-mail; that person is left out of this run | |
| 18 | The rejected person calls the helpline; the call is logged on a paper form | |
| 19 | The bank pays the amount to every matched record, the duplicate included | |
| 20 | The bank nets the day’s payments in its batch; some payments take a day to show | |
| 21 | The bank sends a payment advice to the ministry: a PDF with totals, not names | |
| 22 | The ministry’s finance office checks the totals by hand and enters them in the ledger | |
| 23 | The monthly review meeting discusses rejected records; in this example the duplicate is not on the agenda | |
| 24 | Month end: the bank reconciles the float; the unused part returns to the treasury weeks later (the float hold ends) | |
| 25 | The treasury matches the returned amount to the bank statement by hand; differences are chased for days | |
| 26 | The bank loads the permitted-use list from a ministry spreadsheet; shop codes are keyed in by hand | |
| 27 | A beneficiary buys food at the shop; the cashier checks by hand that the purchase counts | |
| 28 | The shop has made the sale and waits for the bank to settle it (real wait, drawn as a hold on the shop) | |
| 29 | The shop sends its sales report; the bank checks each sale against the permitted-use list in a batch | |
| 30 | The bank settles the shop from the programme float, days after the sale | |
| 31 | The person who was left out queues at the ministry office to appeal; the payment is on hold until a decision (real hold for that person) | |
| 32 | The appeals officer collects ID, proof of address and bank details, then decides; typically weeks (illustrative) | |
| 33 | The corrected name goes back to the bank as a new paper-based file, re-keyed by a clerk | |
| 34 | A supplementary run pays the corrected record; the person has waited in full | |
| 35 | Outside this clock: the auditor collects lists, bank advice and sales reports from the ministry | |
| 36 | The bank sends its payment files to the auditor as CSV files by e-mail; often produced by hand, weeks later | |
| 37 | The audit finds the duplicate record; it was paid, and recovery starts months after the money left | |
| 38 | Recovery starts months later: a letter goes to the person who got the duplicate; many rules need a further process (varies by country) | |

### 12.2 G02 — Government procurement with milestone payments

*With AFC track: 5 steps, about 1 d 2 h 15 min on the illustrative clock. Each row is one animation step; the checks, API calls and coins inside a step play back to back within it, so the step counter matches the captions.*

| # | Today (39 steps) | With AFC (5 steps) |
|---|---|---|
| 1 | The contract is signed on paper: Northline Builders builds for the procuring agency, $12,000,000 in 3 milestones. State Treasury pays. | 1 of 5 · Request. The site visit, the signed evidence and the own-record checks are done. The confirmed payment reaches AFC through the gateway. |
| 2 | State Treasury registers the commitment in its budget system and reserves the limit. A book entry: no money has moved. | 2 of 5 · Accept. AFC checks the signature, contract state and policy version. The treasury anchor accepts the funds on its reserve. |
| 3 | The agency sends a paper copy of the signed contract and the milestone schedule to the treasury by internal mail. | 3 of 5 · Issue. The funds are confirmed. Where the law allows, NodeChain records the proof of transaction, and AST issues ArosCoin 1 = 1. |
| 4 | Northline Builders finishes milestone 1 on site. $4,000,000 is now due under the contract. | 4 of 5 · Accept and convert. The output anchor on the supplier’s bank leg accepts ArosCoin and converts it 1 = 1 into USD. |
| 5 | State Treasury keeps $4,000,000 reserved on its own books. The reservation is real, though the money has not moved. | 5 of 5 · Output. The supplier’s bank credits $4,000,000 on its own books. Notices and a reconciliation record leave through the gateway. The process ends. |
| 6 | The supplier asks the procuring agency, by letter, to commission an acceptance inspection. | |
| 7 | The agency’s registry logs the letter, checks the contract and milestone numbers, and files the request. | |
| 8 | The agency commissions the independent inspector by letter. The request joins the inspector’s queue. | |
| 9 | The request waits in the inspector’s queue. This is a queue, not a hold. Illustrative: about five days here. | |
| 10 | The inspector visits the site and measures the work against the drawings. This physical visit takes the same time in both routes. | |
| 11 | The inspector checks quantities against the bill of quantities. The inspector measures; the agency decides what is accepted. | |
| 12 | The inspector writes a paper measurement report in three copies: one for the agency, one for the supplier, one for the file. | |
| 13 | The signed paper act goes to the procuring agency by courier. Courier delivery typically takes a day or more. | |
| 14 | The agency’s registry logs the act and the courier receipt in a paper register. | |
| 15 | The legal desk checks the act against the contract terms and the milestone schedule. A lawyer reads the file by hand. | |
| 16 | The supplier sends its invoice separately, on paper, by post. Nobody tracks it between the supplier and the agency. | |
| 17 | The finance desk compares the invoice with the act and finds that the quantities do not match. A finance officer decides. | |
| 18 | The finance officer returns the invoice to the supplier by letter. A person decides; nothing is rejected automatically. | |
| 19 | The supplier phones the agency to ask about the payment. The call is not recorded in any file. | |
| 20 | The supplier corrects the invoice and reconciles it with the inspector’s report. Illustrative: about three days, at the supplier’s pace. | |
| 21 | The corrected invoice arrives by post. The review starts again at the first desk, so the act is checked a second time. | |
| 22 | The legal desk checks the corrected invoice against the act and the contract again. Each desk works from its own paper file. | |
| 23 | The finance desk confirms that the quantities now match the act and the measurement report. | |
| 24 | The budget desk confirms that the budget line still covers this milestone under the commitment. | |
| 25 | Three desks sign off one after another. The agency head then signs the payment approval. | |
| 26 | The agency sends a paper payment order to the treasury by internal mail. | |
| 27 | The treasury checks the order against the commitment, the budget limit and the signatures on file. A clerk compares them by hand. | |
| 28 | Dual control: one officer prepares the payment file, a second officer approves it. Both sign on paper before release. | |
| 29 | The payment waits for the next treasury payment run, set by the treasury. This is a queue, not a hold. Illustrative: about four days. | |
| 30 | The treasury releases milestone 1 for payment. The reservation ends and the payment file goes to the bank. | |
| 31 | The treasury sends a payment file to its bank. The bank takes it in the next clearing window; a late file waits for the next one. | |
| 32 | The bank checks the beneficiary account and the file format. Each clearing window has a cut-off time that varies by bank. | |
| 33 | The payment of $4,000,000 from State Treasury settles on the bank’s books. Typically a day or more after the file; varies by country. | |
| 34 | The supplier’s bank credits the account of Northline Builders. The money reaches the supplier weeks after the work was done. | |
| 35 | The treasury posts a paper remittance advice to the supplier. The supplier matches it to its ledger by hand. | |
| 36 | The supplier’s accounts team matches the payment to the invoice by hand and closes the file. | |
| 37 | Month end: the agency and the treasury reconcile their paper records by hand. A difference is cleared by memo. Illustrative: about two days. | |
| 38 | The monthly total goes to the state ledger on paper. Both paper files are closed and archived. | |
| 39 | Milestones 2–3 follow the same route. Each later milestone repeats the paper route. | |

### 12.3 G03 — Taxes and refunds

*Today has 40 steps (≈ 110 d 16 h, illustrative). With AFC has 5 steps (≈ 4 d 2 h, illustrative; the authority's own review time is kept). The With-AFC steps are one animation call each, so the viewer's counter matches the captions.*

| # | Today (40 steps, ≈ 110 d 16 h) | With AFC (5 steps, ≈ 4 d 2 h) |
|---|---|---|
| 1 | Atlas Trading Ltd must settle €1,200,000 in tax for the period. Its own team closes the books and prepares the return first. | 1 of 5 · Request. Bank, treasury and authority each confirm ID A-48213 on their own records. AFC gets the payment through the gateway and routes it to the payer's leg. |
| 2 | The finance team collects invoices, payroll and bank data, often with an outside accountant. Illustrative: about a week. | 2 of 5 · Accept and issue. The payer's EUR anchor accepts the funds on its reserve. Only then NodeChain records the proof and AST issues ArosCoin 1 = 1. |
| 3 | Atlas Trading Ltd files the return with Revenue Authority, online or on paper, depending on the country and the company. | 3 of 5 · Output. The treasury's anchor accepts ArosCoin and pays out EUR from its reserve, with no conversion. The treasury books it on its own books. |
| 4 | Revenue Authority's intake team logs the return. Figures are keyed into the case system; paper attachments are scanned or retyped. | 4 of 5 · Decision. Atlas Trading Ltd claims €144,000 on ID A-48213. Revenue Authority signs the decision. AFC checks the signature and records it on the trail. It decides nothing. |
| 5 | Figures are matched against third-party reports from banks and employers. Mismatches go to an officer. The rules vary by country. | 5 of 5 · Payout. The treasury pays €144,000 on its own books and the bank credits Atlas Trading Ltd. Atlas Trading Ltd is notified through the gateway. The process ends. |
| 6 | An officer reviews the flagged items and works out the tax due: €1,200,000. Review time is illustrative: days or weeks. | |
| 7 | Revenue Authority issues the assessment under ID A-48213. The decision stays with the authority and can be appealed within the period set by law. | |
| 8 | The assessment notice goes out by post, with a payment reference printed in the letter. Illustrative: several days in the post. | |
| 9 | Atlas Trading Ltd's tax team reads the notice and checks the amount against its own calculation. | |
| 10 | The reference is copied by hand into the bank's free-text field. One typo later leaves the payment unallocated. | |
| 11 | Atlas Trading Ltd orders its bank to pay €1,200,000 by internet banking. The assessment number is typed into a free-text field. | |
| 12 | The bank screens the payer and the payment under its own AML and sanctions rules. Minutes to hours. | |
| 13 | The bank reserves €1,200,000 on the company's account until its next payment batch. This is a real hold of funds. | |
| 14 | The company's statement shows the amount as reserved, so the payment looks made. Nothing has reached the treasury yet. | |
| 15 | The bank's operations team applies its cut-off time. A payment after cut-off waits for the next batch. | |
| 16 | The bank sends the payment in its next batch to the national payment system. The reference is free text, so no assessment ID travels with it. | |
| 17 | The treasury cannot tell which assessment the money belongs to. It parks the amount in a suspense account, unallocated. This is a real hold of funds. | |
| 18 | The treasury's cash office books the receipt, unallocated, and prepares a receipts list for Revenue Authority. | |
| 19 | The treasury sends its receipts list to Revenue Authority, days later, as a file. The file has an amount and a free-text reference only. | |
| 20 | One line fails the import because of a stray character. A clerk retypes it by hand, which takes another day. | |
| 21 | Clerks at Revenue Authority match each receipt to an assessment by hand: reference, amount and taxpayer name. Illustrative: several days. | |
| 22 | The reference "A-4813" matches no open assessment: one digit is missing. The clerk does not guess. The case is flagged for review. | |
| 23 | Revenue Authority writes to Atlas Trading Ltd and asks for the payment slip. The letter goes by post. | |
| 24 | Atlas Trading Ltd phones the helpline. It sees the bank's payment date, not the treasury's receipt, so it cannot close the case. | |
| 25 | Atlas Trading Ltd asks its bank for a copy of the payment slip. Some banks need a signed request form. | |
| 26 | The bank looks up the transfer in its own system and prints a payment slip. Illustrative: one to two business days. | |
| 27 | The slip is handed over at the branch or posted to the company. | |
| 28 | Atlas Trading Ltd copies the slip and posts it to Revenue Authority. The slip carries the assessment ID, which the receipt does not. | |
| 29 | With the slip in hand the clerk matches all three. The treasury allocates the money and Atlas Trading Ltd's account shows "paid". Illustrative: about four days. | |
| 30 | Revenue Authority's portal shows the assessment as paid the next day, after its nightly update. | |
| 31 | Later, Atlas Trading Ltd claims a refund of €144,000 (12% of the tax) on a paper form, with copies of the slip and the assessment. Illustrative: a month or more. | |
| 32 | The paper claim is posted to the authority and logged. It joins a queue with other claims. | |
| 33 | The claim waits in the queue. An officer later searches the archive for the payment evidence. Illustrative: weeks. | |
| 34 | The officer asks Atlas Trading Ltd to confirm its bank account for the refund, by post. | |
| 35 | The company posts back the signed account form. Its details are checked against the bank records by hand. | |
| 36 | The officer pulls the file, finds the payment evidence and checks it against the claim and the assessment. | |
| 37 | The officer signs the refund decision. A paper refund order goes to the treasury. Atlas Trading Ltd can still appeal the decision. | |
| 38 | The treasury checks the order against its budget limits and queues it for the next payment run. | |
| 39 | The treasury pays the refund to the company's bank in its next payment run. | |
| 40 | The bank credits Atlas Trading Ltd with €144,000. The refund arrives long after the payment. | |

### 12.4 G04 — Customs

*Today: 35 steps, about 15 d 7 h on the simulated clock (illustrative). With AFC: 5 steps, about 2 d 2 h (illustrative); the physical inspection, where selected, is inside step 5 and takes the same time as on the Today track. The two columns are not matched row by row; each column is numbered on its own.*

| # | Today (35 steps, ≈ 15 d 7 h, illustrative) | With AFC (5 steps, ≈ 2 d 2 h, illustrative) |
|---|---|---|
| 1 | A shipment for Meridian Imports Ltd reaches Port Customs Office. It cannot leave the yard until the declaration is filed, the duty is paid and customs releases it. | 1 of 5 · Request. The bank confirms the $96,000 payment under D-77204. Customs confirms the duty on its records. AFC routes the request. |
| 2 | Port Customs Office keeps the goods in its yard. This hold is real: the goods cannot move until customs releases them. | 2 of 5 · Accept. The USD anchor accepts the $96,000 on its reserve account. AFC holds no funds; the anchor does. |
| 3 | Meridian Imports Ltd’s broker calls customs to ask when the goods can be inspected. The call is noted in a diary, not in a system. | 3 of 5 · Issue. After acceptance, AFC instructs NodeChain (AST) to record the proof. ArosCoin is issued 1 = 1 against the confirmed funds. |
| 4 | Meridian Imports Ltd or its customs broker files the declaration: goods, origin, tariff code and value $800,000. Scanned invoice and bill of lading are attached. | 4 of 5 · Accept. The payout anchor accepts ArosCoin. AFC checks its USD reserve. Both legs use USD, so nothing is converted. |
| 5 | Port Customs Office checks the declaration for completeness: fields, codes and attachments. Some of these checks are still made by hand. | 5 of 5 · Output. Customs is credited on its own books, matches D-77204 and signs the release order. Inspection, if selected, takes the same time as today. |
| 6 | The invoice page is missing. Customs returns the declaration by e-mail. Nothing moves until the file is corrected. |  |
| 7 | The broker reads the reason in the e-mail and types a new file. The correction is keyed in by hand, not copied from the old file. |  |
| 8 | Meridian Imports Ltd re-files the declaration with the missing page. In this example the correction takes a day (illustrative). |  |
| 9 | Port Customs Office accepts the file and looks up the tariff code. Duty = 12% of $800,000 = $96,000. The rate is an example. |  |
| 10 | The risk system selects the shipment for physical inspection or lets it through. The selection rules are customs’ own. |  |
| 11 | A duty notice with a payment reference goes to Meridian Imports Ltd, by post or at the counter. It can take a working day or more (illustrative). |  |
| 12 | Meridian Imports Ltd takes the notice to its bank and orders $96,000. The declaration number is typed into the reference field by hand. |  |
| 13 | The bank screens the payer and the payment under its own rules: sanctions, AML checks and the account balance. |  |
| 14 | The bank checks its payment cut-off time. A payment received after the cut-off waits for the next payment run. |  |
| 15 | The bank debits Meridian Imports Ltd and queues the payment. This is not a hold: customs has received nothing yet. |  |
| 16 | The importer sees the debit on its bank statement. The statement shows an amount and a date, not which declaration it paid. |  |
| 17 | The payment waits in a batch for the central bank settlement window. The windows are set by the central bank and vary by country. |  |
| 18 | The payment run sends $96,000 to customs’ account. It is an unmatched payment, not a hold: customs cannot tie it to D-77204 yet. |  |
| 19 | Overnight the treasury sends customs an end-of-day statement file. An officer prints it the next morning. The payment is listed with no declaration number. |  |
| 20 | The bank gives Meridian Imports Ltd a stamped paper proof of payment at its branch. The proof is paper; no system sees it. |  |
| 21 | Meridian Imports Ltd brings the paper proof to the customs office. The goods have been in the yard since they arrived. |  |
| 22 | An officer searches the open declarations for the same amount. Two files are close, and the paper proof alone does not settle the match. |  |
| 23 | Customs writes to Meridian Imports Ltd by post and asks for the bank’s reference. The letter takes a few days to arrive. |  |
| 24 | Meridian Imports Ltd posts a photocopy of its bank receipt. The copy also takes days to arrive (illustrative). |  |
| 25 | The copy is not enough, so the officer asks the bank to confirm the payment in writing. |  |
| 26 | The bank confirms the payment by letter. This takes one or two working days (illustrative). |  |
| 27 | The officer types the declaration number against the payment by hand. The statement line now reads matched. |  |
| 28 | Customs posts a paper receipt for the duty. It is the only written record the importer gets. |  |
| 29 | Where the risk system selected the shipment, officers inspect it physically. The inspection takes the same time on both routes (illustrative: two days). |  |
| 30 | Where the procedure requires it, a senior officer checks the paper file and co-signs it. Files move between desks. |  |
| 31 | Customs signs the release order itself. This decision stays with customs. |  |
| 32 | The hold ends. The goods can leave once the importer holds the release order. |  |
| 33 | The release order goes to Meridian Imports Ltd on paper. Storage charges build up in the yard for every day of the wait (illustrative). |  |
| 34 | The goods leave the yard. The wait covered the notice, the bank, the paper proof and the bank’s letter. |  |
| 35 | Outside this clock: at month end customs and the treasury reconcile their accounts. Some payments are still matched by hand weeks later (illustrative). |  |

### 12.5 G05 — Intergovernmental (inter-budget) transfers

| # | Today (37 steps, ≈ 66 d 16 h, illustrative) | With AFC (5 steps, ≈ 1 d 3 h, illustrative) |
|---|---|---|
| 1 | Budget law sets the transfers; the ministry must pay under the published conditions | 1 of 5 · Request: regions confirm account, budget line and conditions version; AFC receives the request via the gateway and routes it to the source anchor |
| 2 | The ministry's budget desk splits the allocation by hand in a spreadsheet (illustrative: about a day) | 2 of 5 · Accept: the source anchor accepts the funds on its reserve account; AFC checks them against the request |
| 3 | Transfer orders signed on paper by two officials | 3 of 5 · Issue: after acceptance the proof of transaction is recorded in NodeChain (AST); ArosCoin is issued 1 = 1 |
| 4 | A paper notice goes to each regional treasury by post or courier (illustrative: days) | 4 of 5 · Accept and convert: the payout anchor accepts ArosCoin and converts it 1 = 1; both legs use one currency |
| 5 | The same allocation also goes by e-mail as a working spreadsheet; the signed paper order is the reference | 5 of 5 · Output: each region is credited on its own books and confirms receipt; the audit view reads the linked chain; the process ends |
| 6 | Each regional treasury logs the notice in a paper register and files the original | |
| 7 | A regional accountant phones the ministry about a budget code; the call is noted in a diary | |
| 8 | One payment file to the central bank; orders received after the cut-off wait for the next run | |
| 9 | The central bank checks the file format and the ministry's balance | |
| 10 | Payments wait in the clearing queue for the next window (illustrative: the next business day); a queue, not a hold | |
| 11 | The payment run delivers each region's amount with a short reference, not the notice number | |
| 12 | The money arrives unallocated; each region holds it in suspense until the notice is matched. A real hold | |
| 13 | Each region matches the payment to its paper notice and budget line, by hand | |
| 14 | The last region cannot match its budget line and keeps the money on hold; the others matched theirs | |
| 15 | The matching regions book the money and release it; their holds end | |
| 16 | The last region writes to the ministry by post (illustrative: days) | |
| 17 | A copy goes by e-mail to speed things up; the ministry will not act on it without the paper original | |
| 18 | The ministry looks up its spreadsheet and the paper annex; a budget-code typo is found by hand | |
| 19 | The ministry's legal desk signs the reply; the letter is the decision | |
| 20 | The ministry replies by letter | |
| 21 | The last region books the money to its budget line and releases the hold | |
| 22 | Each region pays its municipalities in its own payment run (spending excluded from both clocks) | |
| 23 | Each municipality confirms receipt by paper letter to its region | |
| 24 | At quarter end, municipalities send paper use reports to their region | |
| 25 | Where a report is missing, the region posts a paper reminder | |
| 26 | Regions retype the municipal reports into their own forms and summarise them by hand | |
| 27 | Each region reconciles its bank statement against its ledger; mismatches are chased by e-mail | |
| 28 | Regional summaries reach the ministry in different formats (PDF, spreadsheet, paper); some arrive late | |
| 29 | The ministry consolidates the summaries by hand; the totals do not tie out to the payments made | |
| 30 | Month-end reconciliation with the central bank by hand; differences chased by e-mail (illustrative: days) | |
| 31 | The central bank returns a paper statement; the ministry types the differences into its own file | |
| 32 | The consolidated report goes to the audit office, on paper and as a PDF | |
| 33 | The audit office asks each region for its bank statements and use reports, by letter | |
| 34 | The regions reply by paper post; some statements are photocopies | |
| 35 | The audit office traces each payment across ministry, regional and municipal books; each set matched by hand | |
| 36 | The audit office sends its findings to parliament on paper; parliament is not drawn | |
| 37 | Part of the money cannot be tied to a use report; follow-up requests go back to the regions by letter | |

### 12.6 G06 — Disaster relief

*Steps — Today (35 steps; 34 when no household lacks ID).** Hours and days are illustrative. The track is one institution-to-institution process: messages, files, paper forms, a queue for clearing, and manual reconciliation.*

| # | Today |
|---|-------|
| 1 | A disaster hits the region; the agency appeals for the relief fund. |
| 2 | The agency's board approves the appeal; its finance team drafts one pledge request for each donor. |
| 3 | The appeal goes out by e-mail and letter; each donor reads it on its own schedule. |
| 4 | Each donor checks its own mandate, budget line and emergency eligibility. Days to weeks; varies by donor. |
| 5 | Donors pledge by letter, each with its own conditions: reporting, currency, eligibility and a release schedule. |
| 6 | The agency signs a separate grant agreement with each donor; each sets its own reporting calendar and release rules. |
| 7 | The agency returns a compliance note: procurement, audit and beneficiary-feedback rules. |
| 8 | The first pledged transfer arrives through the donor's bank, in several parts over several days. |
| 9 | The fund waits on the agency's account. This is a real hold: nobody can be paid until an approved list exists. |
| 10 | The agency asks the local authority for a list of affected households, by letter. |
| 11 | The field office assigns teams to villages and camps. Transport and safe access set the pace: days to weeks. |
| 12 | Officials go door to door with paper forms. The forms are typed into spreadsheets later. |
| 13 | A household without ID cannot be registered: the form has no box for other proof, so it is left off. |
| 14 | A household without ID can ask the field office to re-check. The request is written on paper and waits for the next visit. |
| 15 | The field office signs off the list. |
| 16 | The district office checks the forms against the village lists; missing forms go back to the field team by courier. |
| 17 | The spreadsheet goes back to the agency by e-mail, one file per district. |
| 18 | The agency merges the district files into one master sheet; some fields are retyped by hand. |
| 19 | Duplicates are removed by hand (same family under two spellings, or two families with one phone number). |
| 20 | The finance team approves the payment batch: a signature on a printed sheet, then a file. |
| 21 | A second signatory checks the batch total against the signed sheet before the file leaves the agency. |
| 22 | The approved batch goes to the paying bank as a file; the bank opens it on the next working day. |
| 23 | The agency releases the fund to the paying bank for this batch. |
| 24 | The bank matches the batch to accounts, record by record. A name or birth date that differs from the account is rejected. |
| 25 | Matched payments wait for the clearing window, typically one working day. The money is already on the bank's books: a queue, not a hold. |
| 26 | Records that do not match come back as a file; the agency fixes each one by hand and sends a small second batch. |
| 27 | The bank sends a query file for unclear records; the agency answers by phone, one record at a time. |
| 28 | Households with an ID and an account are paid, weeks after the disaster. |
| 29 | The household without ID receives nothing; its re-check request is still in the paper queue at the field office. |
| 30 | The agency reconciles the bank statement against its spreadsheet, line by line, by hand. |
| 31 | Lines that do not match are chased by e-mail and phone; some stay open for weeks. |
| 32 | The agency sends a narrative report to donors, built from the same spreadsheets, weeks later. |
| 33 | The donor holds the next tranche until it reads and accepts the report. This is a real hold: the money has not moved. |
| 34 | The report is accepted; the donor releases the next tranche. |
| 35 | The next tranche moves to the agency's account, in several parts over several days. |

*Steps — With AFC (5 steps).** One process in its own framed space. Institutions sit outside the frame and reach it only through the API gateway. Anchors and NodeChain sit inside. AFC is not drawn; it is named in the captions as the component that receives the request and routes it. The local authority's registration and in-person checks are the institution's own work and are not shortened by AFC.*

| # | With AFC |
|---|----------|
| 1 of 5 | **Request.** Each institution checks its own data: the accounts and the households without ID. Through the gateway, AFC routes the confirmed donor transfer to the donor leg. |
| 2 of 5 | **Accept.** The donor-leg anchor accepts the funds on its own reserve. AFC checks the arrived funds against the contract. |
| 3 of 5 | **Issue.** After acceptance, the proof of transaction is recorded in NodeChain (AST). Only then ArosCoin is issued 1 = 1. |
| 4 of 5 | **Accept and convert.** The payout anchor accepts ArosCoin and pays USD, 1 = 1, with no conversion. The local authority checks the no-ID cases in person, over days, and signs the record. |
| 5 of 5 | **Output.** The paying bank credits each confirmed account. Its cash-out agent pays the signed no-ID cases in cash, against the record. Notices leave through the gateway to the donors and the agency. The process ends. |

### 12.7 G07 — Aid and grants

*Today has 36 steps at three tranches. With AFC has five steps, every one of them a single animation call, so the step counter matches the captions "n of 5".*

| Stage | Today (36 steps at three tranches; time is illustrative) | With AFC (five steps; tranche 1 animated) |
|-------|-----------------------------------------------------------|--------------------------------------------|
| 1 | Donor's own committee approves the grant, paid in tranches against milestones; the minute is the record (step 1) | 1 of 5 · Request. After a site visit of days the verifier signs milestone 1, and AFC checks the signature. The donor approves tranche 1. AFC routes it to the USD anchor. |
| 2 | Terms are negotiated by e-mail; the signed paper original is couriered; ratification where a country requires it (steps 2–5: agreement, budget line, designated account opened by hand) | 2 of 5 · Accept. The USD anchor accepts the funds on its reserve account. AFC checks them against the request. |
| 3 | Withdrawal application on paper with a progress statement; the donor's fiduciary review; a query for a missing signature, answered by courier; the approval letter is signed on paper (steps 6–10) | 3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1. |
| 4 | Donor's bank sends a payment message; the converting bank screens the payment, quotes its own rate, and converts USD to GEL, keeping its spread (steps 11–15) | 4 of 5 · Accept and convert. The GEL anchor accepts ArosCoin and converts it at the converting bank's quoted rate. The bank keeps its spread. |
| 5 | The batch credit can take a day; the treasury matches it by hand against the approval letter (step 16) | 5 of 5 · Output. The treasury is credited on its own books. The donor gets a notice with signed results and no personal data. The process ends here. |
| 6 | Real hold: the funds wait on the designated account until the ministry of finance and the treasury sign the budget release, in turn (steps 17–19) | — |
| 7 | Payment order goes to the implementing bank through the local clearing system, in its next batch; the bank checks the order under its own rules and credits the project account (steps 20–22) | — |
| 8 | The project runs its own tenders; the donor's no-objection by letter where it is required; the project pays suppliers and beneficiaries from its own accounts (steps 23–25) | — |
| 9 | The project reports on paper, with beneficiary lists attached (names, IDs, addresses); the treasury forwards the report to the donor abroad by e-mail, personal data included (steps 26–27) | — |
| 10 | The donor reviews; questions go back and forth by e-mail, typically for weeks. A query for missing names: the project corrects the lists by hand and resends them, personal data included (steps 28–30) | — |
| 11 | Real hold: the donor withholds the next tranche until it accepts the report; the release follows acceptance (steps 31–32) | — |
| 12 | Tranches 2 and later: the same loop repeats, one step each: application, review, conversion, budget release, another report with names (steps 33–34) | Tranches 2 to k repeat steps 1–5 on their own milestone evidence. They are counted in the tracker and the metrics, not animated. |
| 13 | Years later, outside this clock, an impact audit rebuilds the evidence from reports and site samples; personal data has travelled abroad with every report (steps 35–36) | — |

### 12.8 G08 — CBDC and bank deposits

*Captions show the default names. The track starts at 17:30 for the request. Steps 1–2 are earlier that afternoon and have no clock time of their own.*

| # | Today (Deposit → CBDC) |
|---|------------------------|
| 1 | Earlier that afternoon, in this example, treasury prefunds the bank's settlement account at the central bank by RTGS payment. |
| 2 | The prefunded amount sits in the settlement account. It stays idle until the central bank issues CBDC against it. |
| 3 | At 17:30 Bank A asks to move €5,000,000 from its deposit ledger to the CBDC ledger. Two ledgers, two sets of hours. |
| 4 | Bank A checks the request on its own books: available balance and daily limit. |
| 5 | Sanctions and AML screening of the instruction and both accounts run in the bank's own compliance system. |
| 6 | Bank A checks its intraday liquidity limit. The central bank's ledger closed at 17:00, so nothing can go out now. |
| 7 | Bank A approves the request internally. As is typical for treasury payments, a second approver signs off (four-eyes). |
| 8 | Bank A blocks €5,000,000 on its deposit ledger while the instruction waits. The block is real: the amount is not available to other payments. |
| 9 | The CBDC ledger closed at 17:00 and the bank ledger runs to 18:00. The instruction waits in the bank's outbox until Central Bank reopens at 09:00. |
| 10 | Before release, an operator re-checks the queued instruction against the policy version on file. |
| 11 | At 09:00 an operator releases the instruction. It goes out through the central bank's own channel. |
| 12 | Central Bank validates the message format and checks the bank's participant permission on its own system. |
| 13 | Central Bank checks the participant limit and the prefunded balance on the settlement account, on its own ledger. |
| 14 | Central Bank approves the request. |
| 15 | A second operator at Central Bank signs the posting. Dual control applies, as is typical. |
| 16 | Central Bank issues €5,000,000 of CBDC on its own ledger, drawing on the prefunded funds. CBDC is a liability of the central bank. |
| 17 | Central Bank confirms by message. The confirmation lands in the bank's channel, outside its core system. |
| 18 | The confirmation waits in the channel queue. An operator picks it up and checks it against the instruction. |
| 19 | The operator keys the confirmation into the core system by hand. In this example nothing posts automatically. |
| 20 | The bank sends a technical acknowledgement back to Central Bank through the same channel. |
| 21 | The bank marks the CBDC leg as received. Its deposit debit stays open until the books agree. |
| 22 | The transfer enters the bank's monitoring queue for next-day batch review. |
| 23 | At 18:00 the bank ledger closes. The bank exports its deposit ledger as a statement file for the back office. |
| 24 | The evening batch posts the CBDC leg to the general ledger. The bank's ledger is closed for the day. |
| 25 | Overnight Central Bank reconciles its settlement account and its CBDC ledger. The CBDC ledger reopens at 09:00. |
| 26 | Early the next morning Central Bank sends its position report to the bank by message. It is a second message, not the statement. |
| 27 | The central bank's CBDC statement arrives at the back office as a file, after its end-of-day run. |
| 28 | In this example the first deposit extract has a formatting error. Staff re-run it from the core system. |
| 29 | The back office loads both files into a spreadsheet and matches them line by line. |
| 30 | One line does not match: the value dates differ. Staff e-mail both sides. A person decides, not a system. |
| 31 | The break is raised as an exception and assigned to a case handler. It stays open until both sides reply. |
| 32 | Staff e-mail the central bank's operations desk with the line and both value dates. |
| 33 | In the afternoon the central bank replies by e-mail. Its ledger used the value date it booked on the day. |
| 34 | The value dates are agreed by e-mail. The entries are matched by hand against both statements. |
| 35 | The break is cleared by e-mail. Every line now matches in the spreadsheet. |
| 36 | Finance posts the CBDC entry in the general ledger as a manual journal. The controller signs; the printout is filed, as is typical. |
| 37 | The signed journal goes back to the bank's core system as a file for the overnight batch. |
| 38 | Compliance clears the next-day monitoring review by hand. In this example it finds nothing to change. |
| 39 | Next morning the overnight batch posts the debit and releases the block. In this example that is about two days after the request. |

*One process in its own framed space. The two institutions sit outside the frame and reach it only through the API gateway. Inside the frame are the deposit anchor (left, under the bank), NodeChain, and the CBDC anchor (right, under the central bank). AFC is not drawn; it is named in the captions as the component that receives the request and routes it. The bank's checks and the central bank's checks are shown on each institution's own circle. There are no holds on this track: no padlock and no HOLD label. The "closed until 09:00" note is a status, not a hold.*

| # | With AFC (Deposit → CBDC) | With AFC (CBDC → Deposit) |
|---|---------------------------|---------------------------|
| 1 of 5 | 1 of 5 · Request. The bank runs its own checks, then sends one confirmed instruction and its funds through the gateway. AFC routes it to the deposit leg. | 1 of 5 · Request. The bank runs its own checks, then sends one confirmed instruction through the gateway. AFC routes it to the CBDC leg. |
| 2 of 5 | 2 of 5 · Accept. The deposit anchor accepts the funds on its own reserve account. AFC checks them against the instruction, and the transaction is confirmed. | 2 of 5 · Accept. The CBDC leg is closed until 09:00. At 09:00 the central bank checks permission, limit and availability; the CBDC anchor accepts the funds on its reserve. |
| 3 of 5 | 3 of 5 · Issue. After acceptance, the proof goes to NodeChain and AST issues ArosCoin 1 = 1. The CBDC leg is closed until 09:00, so the process waits. | 3 of 5 · Issue. After acceptance, the proof goes to NodeChain and AST issues ArosCoin 1 = 1. No token exists before the funds are accepted. |
| 4 of 5 | 4 of 5 · Accept and convert. At 09:00 the central bank checks permission, limit and availability. The CBDC anchor accepts ArosCoin and converts it 1 = 1. | 4 of 5 · Accept and convert. The deposit anchor accepts ArosCoin and converts it 1 = 1. The bank checks its own deposit account and limit. |
| 5 of 5 | 5 of 5 · Output. Each ledger books its own leg: the bank is debited, the central bank issues CBDC. Notices go out. The process ends. | 5 of 5 · Output. Each ledger books its own leg: the central bank redeems CBDC, the bank is credited. Notices go out. The process ends. |

### 12.9 G09 — Tokenised sovereign bonds

*Steps*

| # | Today (39 steps, hours) | With AFC (5 steps, hours) |
|---|-------------------------|---------------------------|
| 1 | The investor orders the bonds; money and bond travel on two separate routes | 1 of 5 · Request. Each owner checks its own records: the custodian and the registry check the account, eligibility and availability; the debt office checks the order; the investor's bank screens and confirms the payment. The investor's bank sends the confirmed payment and its funds through the gateway. AFC routes them to the investor-currency anchor |
| 2 | The debt office checks the order against the allotment and the bond series, on its own books | 2 of 5 · Accept. The cash-leg anchor accepts the funds on its reserve account, held for AFC. AFC checks them against the request and the transaction is confirmed |
| 3 | The debt office allots the bonds to the investor in its own system | 3 of 5 · Issue. After acceptance, the proof of transaction goes to NodeChain and AST issues ArosCoin 1 = 1. AFC routes the title instruction to the registry through the gateway. The registry checks, records the title on its own register and confirms through the gateway |
| 4 | The investor instructs its bank to pay the debt office; the order is a message | 4 of 5 · Accept and convert. The bond-currency anchor accepts ArosCoin and converts it at its own illustrative rate. No conversion is needed when the currencies are equal; it then pays out 1 = 1 |
| 5 | The investor's bank screens the payer and beneficiary for sanctions and AML and checks its FX line, on its own systems | 5 of 5 · Output. The bond-currency amount is credited to the debt office on its own books (settlement between books, no money crosses the frame). NodeChain links the cash proof to the registry's confirmation. Notices leave through the gateway to the four institutions. The process ends |
| 6 | The bank blocks the amount on the client's account while the payment is queued (a real hold) | |
| 7 | The payment misses the same-day cut-off and waits overnight for the next settlement window (illustrative, about 14 hours) | |
| 8 | At the morning window the payment message goes to the settlement bank; each bank keeps its own ledger | |
| 9 | The settlement bank checks liquidity, sanctions on the debt office's account and the payout route | |
| 10 | The settlement bank earmarks liquidity for the payout (a real earmark, not available to its other clients) | |
| 11 | The settlement bank's FX desk executes the conversion at its own rate, within its own limits | |
| 12 | The funds move to the settlement bank, which converts and takes its fee and the FX spread | |
| 13 | The settlement bank credits the debt office's treasury account; the credit posts in the settlement cycle | |
| 14 | A payment advice goes to the debt office by message; it carries the payment reference, not the bond | |
| 15 | The settlement bank confirms the payment to the investor's bank by message; only this confirmation lets it release its block | |
| 16 | The investor's bank releases its block and posts the debit on the client's account | |
| 17 | The settlement bank releases its earmark once the payout is booked | |
| 18 | Cash is booked on day 1; the bond has not moved; nothing links the payment to the registry (banner: PAID · BOND NOT DELIVERED) | |
| 19 | The debt office sends the allotment to the registry as a file package in the afternoon batch | |
| 20 | The registry checks the investor's account and eligibility in its own queue; the queue runs in batches and this one waits for the next (illustrative, about 14 hours). This is a queue, not a hold on money | |
| 21 | The registry cannot match the investor to a securities account and queries the custodian; a person at the registry reviews the case | |
| 22 | The query goes to the custodian as a document by secure e-mail; there is no system-to-system call | |
| 23 | The custodian checks the account details against its own records and prepares an answer under its own cut-off | |
| 24 | The answer returns as a document; the registry keys the account number into its register by hand | |
| 25 | The registry checks the keyed account number a second time; nothing is posted automatically | |
| 26 | The registry registers the investor as holder through the custodian; bond title stays in the register | |
| 27 | The bond is credited on the registry's books; the debt office has not been told (banner: BOND CREDITED · NOT MATCHED) | |
| 28 | The custodian tells the investor on paper that the bond is credited | |
| 29 | After the next batch, a registry notice goes to the debt office as a document; it carries no payment reference | |
| 30 | The settlement bank's end-of-day statement reaches the debt office as a file the next morning | |
| 31 | Treasury staff load the statement, the payment advice and the registry notice into a spreadsheet and match them by hand | |
| 32 | One line does not match: the value dates differ; the line becomes an exception for a person to decide | |
| 33 | Staff e-mail the settlement bank's operations desk with the line and both value dates | |
| 34 | The next day the settlement bank replies by e-mail; its ledger used the value date it booked that day | |
| 35 | The value dates are agreed by e-mail; the entries are matched by hand against both statements | |
| 36 | The break is cleared in the spreadsheet; people did the matching, not a system | |
| 37 | Finance posts the entry as a manual journal; the controller signs and a printout goes into the audit file. Practice varies by country | |
| 38 | Next morning the registry and the custodian reconcile their holdings by file, in batch; neither file contains the payment | |
| 39 | The bond and the cash are matched by hand, days after the payment (banner: MATCHED BY HAND) | |

### 12.10 G10 — Carbon / energy subsidy

*Clocks are illustrative. Today runs for about 111 days in total; the largest waits (desk queue, committee, batch) are examples, not service levels. The With-AFC clock starts with the on-site check, which takes about three days in both routes.*

| # | Today (37 steps, ≈ 111 d) | With AFC (5 steps, ≈ 3 d) |
|---|---|---|
| 1 | Company finishes an efficiency project; its own meters show the claimed quantity. The figure is the company's own, not yet checked | 1 of 5 · Request. The confirmed payment arrives through the gateway with the signed result for the verified quantity and the ministry's approval. AFC routes it |
| 2 | Company compiles the paper pack: claim spreadsheet, twelve months of meter logs, calibration certificates, invoices (illustrative: about ten days) | 2 of 5 · Accept. The anchor accepts the treasury's currency on its reserve account. AFC checks the arrived funds against the request |
| 3 | Company posts the paper application to the registry: claimed quantity, rate, total | 3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1 against the confirmed currency |
| 4 | Registry logs the application, stamps the receipt, opens a file (waits in the registry queue) | 4 of 5 · Accept and convert. The payout anchor accepts ArosCoin and converts it into the currency, 1 = 1. AFC checks its reserve |
| 5 | Registry finds the calibration certificates missing; a letter asks for them, the file stops | 5 of 5 · Output. The company's bank is credited the payout on its own books. Notices go to the company and the ministry through the gateway. The process ends here |
| 6 | Company posts the certificates and the missing meter logs by mail (illustrative: about a week) | |
| 7 | File waits in the desk queue (illustrative: several weeks) | |
| 8 | Desk officer checks forms, spreadsheet arithmetic and the eligible period; meters cannot be checked from a desk | |
| 9 | Officer searches the ministry's own grants register for other public money on the project (manual) | |
| 10 | Ministry asks the treasury to commit the claimed amount to the scheme budget (paper form) | |
| 11 | Treasury's budget office checks that the scheme line has room (typically a day or two) | |
| 12 | Treasury enters a budget commitment for the claimed amount. A real hold on budget, not on cash: the amount is unavailable for other claims | |
| 13 | Treasury confirms the commitment to the ministry by letter; it stays until paid or cancelled | |
| 14 | Ministry orders an on-site check by an accredited verifier (paper order with the claim and meter list) | |
| 15 | Verifier fixes the visit date with the plant by phone, ministry in copy (illustrative: about ten days) | |
| 16 | On site: verifier checks calibration certificates against the meters, reads logs, samples readings (typically two to three days) | |
| 17 | Verifier confirms a lower quantity than claimed; counts only readings matched to valid calibration | |
| 18 | Verifier sends draft findings to the ministry on paper, with calibration annexes | |
| 19 | Ministry forwards the draft findings to the company on paper; the company has a set period to comment | |
| 20 | Company accepts the verified figure in writing. A dispute would stop the file for a second check (not shown here) | |
| 21 | Verifier's final report goes to the ministry on paper, with signed annexes and site photographs | |
| 22 | Ministry re-keys the verified figure by hand into its own spreadsheet; nothing is linked to the company's data | |
| 23 | The gap between claim and verified data shows up only now, weeks after the claim was filed | |
| 24 | Legal unit checks a draft decision on the reduced amount against the scheme rules (typically several days) | |
| 25 | Ministry sends the decision on the reduced amount by post; the company may appeal within a set period | |
| 26 | Appeal period runs (illustrative: two weeks). No appeal is filed here; an appeal goes to a person for review | |
| 27 | Claim waits for the monthly approval committee | |
| 28 | Committee approves the subsidy for the verified quantity | |
| 29 | Ministry sends a paper payment order to the treasury, signed by two officials | |
| 30 | Treasury checks the order against the commitment and the signatures on file; a mismatch goes back | |
| 31 | Order waits in the treasury's next payment batch (often weekly or monthly); the commitment stays in place | |
| 32 | Payment run releases the commitment; the approved amount is paid, the rest returns to the scheme budget | |
| 33 | Treasury pays through the central bank's payment system; settlement is same day or next day, depending on the system | |
| 34 | Bank credits the company's account; where the reference is missing or wrong, staff match the payment by hand | |
| 35 | Bank sends a statement line to the company, on paper or as a PDF; the company reconciles it | |
| 36 | Company is paid; the evidence sits in paper files at three offices | |
| 37 | Ministry files the paper case; the audit office may sample it later, and the evidence is rebuilt from paper | |

### 12.11 G11 — State-owned enterprise treasury

*Today: 39 steps, in hours. With AFC: 5 steps, in hours (the track runs in minutes of process time; the bank posting times are not shown).*

| # | Today (39 steps) | With AFC (5 steps) |
|---|------------------|--------------------|
| 1 | The holding's treasury needs one cash position across the subsidiaries, each with its own bank, and a funding decision for Sub A | 1 of 5 · View. Treasury asks for the group position. AFC routes the request to each bank, which confirms its own subsidiary's balance under its mandate |
| 2 | Treasury checks the cash forecast. Sub A's finance team has e-mailed a shortfall: a supplier payment falls due in three days | 2 of 5 · Request and accept. Treasury instructs the amount. Bank 2 confirms the debit, AFC routes it, and the anchor accepts the funds on its reserve |
| 3 | Treasury e-mails each bank and each subsidiary for yesterday's closing balance; every bank has its own request form and cut-off time | 3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1 against the confirmed funds |
| 4 | Each subsidiary's controller logs in to its bank's portal with a password and a one-time code; some banks first ask for a signed form | 4 of 5 · Accept and convert. The anchor accepts ArosCoin and converts it back into the same currency, 1 = 1. AFC checks the payout reserve |
| 5 | Each bank closes its end-of-day run; booked, available and blocked balances differ; cut-off times differ by bank | 5 of 5 · Output. Bank 1 is credited on its own books; Bank 2 has debited Sub B. The holding is notified through the gateway. The process ends |
| 6 | Replies come back over two days as PDFs, spreadsheets and e-mails, each in its own format and time | |
| 7 | Staff retype every figure from PDFs and spreadsheets into one workbook and check each number by hand | |
| 8 | Stamp: workbook consolidated; the group position is known, but it is already two days old | |
| 9 | Treasury reconciles the workbook: cut-off times, value dates and FX rates taken on different days do not match | |
| 10 | Treasury keeps a sheet of each bank's format and cut-off time, and updates it by hand when a bank changes its format | |
| 11 | Treasury queries Bank 2: its PDF total differs from Sub B's ledger by a blocked amount; the query waits for the bank | |
| 12 | Bank 2 checks its own ledger; a second officer signs off the corrected statement, which goes out the next morning | |
| 13 | Bank 2 e-mails the corrected statement as a PDF; treasury updates one row of the workbook by hand | |
| 14 | The workbook shows Sub B holding idle cash at Bank 2, while Sub A at Bank 1 needs the funding amount | |
| 15 | The group CFO reviews the funding proposal under the treasury policy; above the policy limit the holding's board must approve | |
| 16 | Stamp: approvals are minuted; limits and approvers differ by country and holding; minutes are filed on paper or as scanned PDFs | |
| 17 | The tax team checks the interest rate on the intra-group loan against transfer-pricing rules; typically one to two days | |
| 18 | Legal drafts the intra-group loan agreement; both subsidiaries' directors sign paper originals, which are kept on file | |
| 19 | Treasury e-mails a scan of the draft loan and the transfer request to Bank 2's compliance team | |
| 20 | Bank 2's compliance team asks for the signed loan agreement before it releases any payment; the payment waits for the document | |
| 21 | Treasury couriers the signed agreement and the paper transfer order to Bank 2; typically a day or two in the post | |
| 22 | Bank 2 compares the order's signatures with its specimen cards and checks that Sub B's director is still authorised | |
| 23 | A second officer keys the order into the corporate banking system and approves it; two people act on every payment | |
| 24 | Bank 2 calls Sub B's director on a registered number to confirm the order (call-back, about an hour) | |
| 25 | Hold (real): Bank 2 reserves the amount on Sub B's account until the payment is sent; the money is still Sub B's but cannot be used | |
| 26 | Bank 2 submits the payment to the clearing system; the batch closes at a fixed time and this payment arrives after it | |
| 27 | The clearing system checks format, duplicates and bank limits, then queues the payment for the next batch; typically the next business day | |
| 28 | Treasury e-mails Bank 1 to ask when Sub A will be credited; Bank 1 answers that it depends on the batch | |
| 29 | The next morning the batch runs; Bank 2 releases the reservation as the payment leaves its books (hold ends) | |
| 30 | Bank 2's side of the payment goes into the clearing system | |
| 31 | The clearing system credits Bank 1; Sub A's funding arrives about a day after the order was approved | |
| 32 | Bank 1 checks the beneficiary name and account, runs sanctions screening, then credits Sub A after its own checks | |
| 33 | Bank 1 confirms by e-mail; treasury matches the credit to the paper order by hand, using the reference Bank 2 typed in | |
| 34 | Sub A is funded days after the need was spotted, and the workbook is already out of date again | |
| 35 | Bank 2's next statement shows the debit; Sub B's controller matches it to the ledger by hand | |
| 36 | Treasury re-keys the new balances into the cash forecast and e-mails the update; the forecast is again a day old | |
| 37 | Stamp: each subsidiary books the loan in its own system; the paper trail is filed separately by each bank and by the holding | |
| 38 | At month-end the accounts team matches the intra-group balances; a one-day timing difference is common and is chased by e-mail (illustrative: often weeks later, not counted in the clock) | |
| 39 | The owner receives a consolidated cash report built on a position that was already days old when it was prepared | |

### 12.12 G12 — Cross-border trade corridor

*Today: 33 steps, about 8 d 1 h on the illustrative clock. With AFC: 5 steps, about 9 h on the illustrative clock. Time figures are examples; they vary by country and by institution.*

| # | Today (33 steps, ≈ 8 d 1 h) | With AFC (5 steps, ≈ 9 h) |
|---|---|---|
| 1 | Export customs in the exporter's country checks the export declaration. Outside both clocks | 1 of 5 · Request: each institution checks its own side on its own circle; the confirmed payment reaches AFC through the gateway, which routes it to the importer-side anchor |
| 2 | The goods cross the border one way. The voyage is excluded from both clocks | 2 of 5 · Accept: the importer-side anchor accepts the funds on its own reserve account; AFC checks the arrived funds against the request |
| 3 | Import customs examines the declaration and will not release the goods without paper proof of payment | 3 of 5 · Issue: only after acceptance, the proof of transaction goes to NodeChain (AST); AST issues ArosCoin 1 = 1 |
| 4 | The buyer's bank screens the buyer and the payment (sanctions, AML, PEP); alerts wait in a manual queue | 4 of 5 · Accept and convert: the exporter-side anchor accepts ArosCoin and converts it at its own quote; the payout-side window still applies |
| 5 | A clerk checks the invoice and the bill of lading by hand; a mismatch stops the order for documentary review | 5 of 5 · Output: the exporter's bank is credited on its own books; notices go out through the gateway; import customs reads the evidence through the gateway and releases the goods |
| 6 | The bank files its screening record for its own regulator; the exporter's bank never sees it | |
| 7 | The payment reference omits the invoice number; the bank asks the buyer to resend, by phone (about a day) | |
| 8 | The importer's bank blocks the buyer's funds. **Real hold**: the buyer cannot use the money until the payment completes or fails | |
| 9 | The payment message goes to the central bank on the importer's side, which accepts messages only before its daily cut-off | |
| 10 | The message arrives after the cut-off and waits for the next morning window (about ten hours). A queue, not a hold | |
| 11 | The importer-side central bank applies its own rulebook: liquidity, limits, sanctions screening, finality rule | |
| 12 | The importer-side central bank accepts the payment under its own rules (window open, fee applied) | |
| 13 | Settlement starts: the importer's bank pays the central bank on its own books; the buyer's block ends | |
| 14 | The cross-border link passes the message to the exporter-side central bank; it waits for that system's own window | |
| 15 | A field fails the format check on the link; an operator repairs it by hand and resubmits (about six hours) | |
| 16 | The exporter-side central bank runs its own checks: cut-off, limits, fee, finality rule | |
| 17 | The exporter-side central bank accepts the payment and prepares the credit | |
| 18 | The cross-border leg settles on the exporter-side books; the conversion takes its own fee and spread | |
| 19 | The central bank sends the credit advice to the exporter's bank in its own batch file | |
| 20 | The exporter's bank screens the sender and the payment, then matches the credit to the invoice by hand | |
| 21 | The credit sits in a suspense account until a clerk matches it (one to two days). A queue, not a hold on the buyer's funds | |
| 22 | The exporter's bank credits the exporter, less its lifting fee; each leg settled on its own books | |
| 23 | The importer's bank issues a paper payment confirmation; the buyer collects it and takes it to import customs | |
| 24 | The buyer waits with the paper in the customs queue (a day or more, depending on the office) | |
| 25 | Import customs matches the proof to the declaration by hand; clearance is its own decision; a physical inspection, if picked, adds days | |
| 26 | Import customs releases the goods; each stage kept its own rules | |
| 27 | A paper copy of the customs release goes to the exporter by post, and the exporter passes it to its bank (several days) | |
| 28 | The exporter's bank closes its file: credit, invoice and release matched by hand | |
| 29 | End-of-day match in the importer-side central bank; a mismatch is fixed by hand the next day | |
| 30 | End-of-day match in the exporter-side central bank; each bank keeps its own records | |
| 31 | The exporter's bank and the importer's bank each keep their own paper and electronic records; nothing links them automatically | |

## 13. Main scenario — Fiat to a crypto wallet (2026-10-16)

Key `fc`. Any institution sends an amount to one crypto wallet, delivered in the crypto asset the request names (example: USD 1,000,000 delivered as BTC).

**Today (no AFC).** Real path, step by step, 40 steps: the sending bank checks the customer and authorises a card payment to an exchange (holds the authorisation); the client opens an exchange account, passes KYC tiers; the exchange's backend (card and bank rails, liquidity, custody ledger, withdrawals) buys the crypto and credits a custody balance; the withdrawal to the wallet goes through the travel-rule check; the exchange broadcasts the transfer; the blockchain confirms it; the card settles one or more days later. Holds and messages are shown on each hop.

**With AFC.** Five steps: (1) the request, with an already confirmed transaction, arrives through the API gateway and AFC routes it to the fiat anchor; (2) the fiat anchor accepts the funds on its reserve account; (3) after acceptance, AFC instructs AST, the proof of transaction is recorded and ArosCoin is issued 1 = 1; (4) the crypto anchor accepts ArosCoin and converts it into the requested crypto (only because the request names one); (5) the crypto is issued to the wallet and the process ends.

Model rules for the With-AFC track: The AFC process routes each request inside its own space; the routing component is not drawn as a separate element. Anchors accept money on reserve accounts and never accept requests. No holds on the With-AFC track. No token exists before acceptance.

**Timing.** The band "Seconds to minutes (target · PoT ≤ 15 min)" describes the whole transaction, from the initiating institution to the receiving side, including the checks each side performs before it accepts. It is not AFC's processing time alone.
