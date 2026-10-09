# Settlement Simulator — specification

**Status:** Spec v0.1 + prototype (scenario 01 only). Not a product surface; presentation only.
**Date:** 2026-10-09
**Owner decisions captured:** 2026-10-09 (chat with product owner).
**Surface:** Public showcase (`docs/portal/PUBLIC-SHOWCASE-SITE.md`). UI language: English (other packs later).
**Prototype:** review build published for owner approval; after approval it moves to `portal/frontend/public/simulator/index.html` (static, self-contained, no backend calls).

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
| Typeface | League Spartan (Google Fonts), system sans fallback |
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
| Completed check | Stamp card above the circle (`✓ …`) |

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

Participants: **Fiat Anchor A**, **Correspondent (FX executor)**, **Fiat Anchor B**. Above them runs the **AFC protocol layer** (a thin bus). Above the bus sits a separate **NodeChain node (AST)**.

| # | Step |
|---|------|
| 1 | Request arrives at Fiat Anchor A |
| 2 | API call rises from Anchor A to the AFC layer |
| 3 | One pass: every participant runs its own KYC/AML and account checks at the same time (rings flash together) |
| 4 | One combined stamp on the AFC layer: contract terms, parties, accounts, FX quote |
| 5 | PoT: a gold spark (fee, ArosCoin) leaves for NodeChain; NodeChain records `verified = 1` |
| 6 | Anchors settle on their own books: coins A → executor (convert) → B. No hold chain, no ACK wave |

### 4.3 Ontology rules (hard)

- AFC is a **logical process layer**. It holds no assets, no balances, no nodes and no custody core. It is never drawn holding coins.
- NodeChain and ArosCoin belong to **AST** and are drawn as a separate node above the AFC layer, never inside it.
- Fiat anchors are the institutions that hold and move money. Conversion is executed by an anchor/executor, orchestrated by AFC.
- ArosCoin appears only as the PoT fee spark. It never carries the payment amount.
- The gold spark does not illustrate or claim token price growth (Canon §9.3: the internal value estimate is not a market price).

## 5. Controls

Mode (`Today` / `With AFC` / `Side by side`) · From currency · To currency · Amount · Play/Pause · Step · Restart · Speed (1×, 2×, 4×). Respects `prefers-reduced-motion` (rings stop spinning, pulses jump). Works at phone width.

## 6. Numbers and claims policy

- Every timing, fee and FX rate is labelled **Illustrative**. They are examples, not quotes, SLAs or performance claims.
- The Today track depicts a **slow multi-hop corridor**. Public data: SWIFT reports most gpi payments reach the beneficiary bank fast (89% within an hour in 2023), while BIS/CPMI (2022) found slow routes can exceed two days. The footnote states this.
- With AFC, timing is shown as seconds-to-minutes, not a fixed figure. Canon §XII sets the PoT confirmation timeout at 15 minutes; the simulator must not promise faster finality than that.
- Fee placeholders (until a tariff is ratified): correspondent fee 25 USD each, beneficiary lifting fee 15 USD, FX spread 0.20% (same in both tracks, set by the converting institution). PoT fee follows Canon §9.4 (`fee = amount × feeRate`) with the Canon §XII sandbox example `feeRate = 0.15%`. All shown as USD-equivalent.
- Owner note: at the sandbox rate the PoT fee on large tickets exceeds flat correspondent fees (1,500 vs ~65 USD on 1M). The simulator shows this as is; the AFC case rests on time and locked liquidity until a tariff is ratified.
- Illustrative FX rates are embedded for major currencies; for others the destination amount is shown as "at anchor rate".

## 7. Backlog (next scenarios)

1. Tokenization of an institutional asset in AST (Today vs AST: valuation → PoT → NodeChain record → mint at institutional price).
2. Further AFC applications — to be listed by the owner (trade finance, FX, payouts, domestic interbank clearing are candidates).

## 8. Acceptance (scenario 01)

- [ ] Owner approves visuals of the prototype.
- [ ] Legal review of on-screen copy (`afc-legal-review`).
- [ ] Linked from showcase.
