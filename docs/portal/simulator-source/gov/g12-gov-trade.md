### G12 — Cross-border trade corridor

Key `gov-trade` · group *Government* · registry entry in `gov/g12-gov-trade.js`.

| | |
|---|---|
| **Buyer** | Central banks / customs / banks |
| **Effect** | Faster compliant settlement |
| **Main risk** | Sanctions and geopolitics. Sanctions screening stays with each bank and each customs authority; AFC never routes around a screening. |

**Today.** A neutral trade corridor (the default is Georgia — Kazakhstan, Caucasus–Caspian region). Goods cross the border one way and the payment travels back. The institutions talk to each other, as they do now: the importer's bank, the central-bank / RTGS leg on each side, the exporter's bank and customs on both sides each apply their own cut-off, fee, finality rule and manual check. Paper, queues and clearing windows sit between them.

**With AFC.** One process space with states and evidence. Each institution checks its own side on its own circle, and reaches the process only through the API gateway. The confirmed payment reaches AFC through the gateway, which routes it to the importer-side anchor. The anchors accept money on their reserve accounts; ArosCoin is issued 1 = 1 only after the proof of transaction. The exporter-side anchor converts, and the exporter's bank is credited on its own books. Import customs reads the payment evidence in AFC and releases the goods under its own procedures. AFC is not drawn; the captions name it.

#### Inputs

| Field | Type | Default | Effect on the picture |
|---|---|---|---|
| Corridor (exporter — importer) | text (≤ 26) | Georgia — Kazakhstan | Split at the dash into the two sides: names the border sides, the RTGS legs and the customs offices (a missing second name shows as "Country B", a missing first name as "Country A") |
| Your bank (exporter's) | text (≤ 26) | Caucasus Trade Bank | Labels the exporter's bank circle and captions |
| Importer pays in | currency | KZT | Coins at the start of the payment, hold text, the importer-side anchor and captions |
| Exporter paid in | currency | GEL | Conversion step, payout-side anchor, coin currency and the credited amount. If no illustrative rate exists for the pair, captions say "the converted amount in <currency>" instead of a number |
| Trade amount | amount | 60,000,000 | Amount in the importer's currency; converted with illustrative rates; the amount on the importer's hold |

#### Steps (default inputs)

Today: 33 steps, about 8 d 1 h on the illustrative clock. With AFC: 5 steps, about 9 h on the illustrative clock. Time figures are examples; they vary by country and by institution.

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

Shown live: the simulated clock; holds and the amount on hold; hold time; messages and paper documents (Today) or API calls and PoT records (With AFC); fees and FX spread. The hold rows count only real holds, meaning funds that a bank blocks while waiting for another party. The importer's bank blocks the buyer's funds for the payment; the exporter's bank's suspense queue and the central-bank cut-off queues are queues, not holds, and are labelled so. With AFC there are no holds: each condition is a check on the responsible institution's own circle. The two tracks accrue the same corridor fees (the two legs' central-bank fees, the lifting fee and the FX spread). With AFC only a protocol (PoT) fee is added, with no amount until its tariff is ratified, so no fee saving is claimed.

#### What AFC does not do here

- It does not screen for sanctions or AML, and it never routes around a screening. Each bank (the importer's and the exporter's) and each customs authority screens on its own side; a hit stops the payment for that institution's review.
- It does not claim atomic settlement across the two systems. Each leg settles on its own books under its own cut-off times; the legs are linked by evidence.
- It does not replace the central banks, RTGS systems, correspondents or customs, and it does not remove RTGS windows, time zones, customs clearance or physical inspection.
- It does not hold or move money. The anchors hold their own reserve accounts; funds are accepted on the reserve when they arrive with the confirmed request.
- It does not remove any institution's own fee, cut-off or check, and it does not decide for any institution. No ArosCoin moves with a payment; PoT is a record signal to NodeChain, and no token exists before acceptance.
- Corridor names, currencies, rates and timings are examples; no real corridor performance is implied.
