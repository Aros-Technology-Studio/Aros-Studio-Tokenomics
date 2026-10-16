### G11 — State-owned enterprise treasury

**Key:** `gov-soe` · **Buyer:** state holdings / banks · **Effect:** liquidity visibility · **Main risk:** concentration (AFC must not become a single point of control).

A holding with subsidiaries at several banks needs one view of cash and quick intra-group funding. Today balances come back by e-mail and PDF, are retyped by hand, and funding waits on a paper transfer order, a bank's compliance check and a clearing batch. With AFC each subsidiary signs a mandate with its own bank, each bank confirms its own balance in one pass, the holding sees only the permitted balances, and each bank books its own side of the transfer. Each bank keeps its own accounts; nothing is held at AFC.

**Inputs (all used on screen)**

| Input | Type | Default | Effect on the scene |
|-------|------|---------|---------------------|
| Your holding | text (≤ 26) | State Holding | Labels the holding circle (the initiating institution), the workbook captions and the captions of both tracks |
| Currency | currency | USD | Currency of every coin, balance, chip and amount; the anchors' currency in the With-AFC track |
| Subsidiaries (2–5) | number 2–5 | 3 | Today: number of bank circles, replies and workbook rows. With AFC: number of bank circles and balance chips |
| Funding amount | amount | 2,000,000 | Transfer and hold amount; also scales the illustrative balances (Sub A is short, Sub B holds idle cash) |

**Steps**

Today: 39 steps, in hours. With AFC: 5 steps, in hours (the track runs in minutes of process time; the bank posting times are not shown).

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

The With-AFC steps are animation calls: each caption starts with "n of 5", and the checks each bank makes run on its own circle inside its step. The comparison assumes each signed mandate is already in force; setting up mandates takes the time the banks and subsidiaries need, and is not counted in the With AFC clock. The metric rows "Mandates in force" (shown from the first step, when each bank checks its mandate), "Balances confirmed by banks" (0 until the view step's banks confirm) and "Protocol fee (PoT)" ("—" until the PoT step, then "tariff TBD") do not show results before the step that produces them.

**What AFC does not do here**

- It does not open accounts, hold balances or hold funds. Each subsidiary keeps its accounts at its own bank; the anchors hold only their own reserve accounts for the transfer, and each bank books on its own books.
- It has no holds on the With-AFC track. Each bank's checks (mandate, limit, balance) are shown on its own circle; a padlock or a HOLD label would be a Today-style hold, and the With-AFC track does not use one.
- It is not a single point of control. The holding sees only what each signed mandate permits; any subsidiary or bank can revoke its mandate, and if AFC is unavailable the banks and the holding fall back to today's process.
- It does not decide who may be funded. Limits, approvals and loan terms stay with the subsidiaries, their boards and the banks.
- It does not remove bank cut-off times. Each bank posts the transfer under its own cut-off; the track shows the process, not the posting time.
- Balances, timings and amounts are illustrative. The protocol (PoT) fee has no public amount until its tariff is set.
