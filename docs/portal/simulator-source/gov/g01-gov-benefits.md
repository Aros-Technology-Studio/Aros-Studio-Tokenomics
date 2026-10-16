### G01 — Targeted benefits

**Key:** `gov-benefits` · **Buyer:** Ministry of Finance / social protection · **Effect:** less leakage · **Main risk:** discrimination and eligibility errors.

A monthly support payment to eligible people. Today the budget is pre-funded to a bank, the list travels as a file, and a duplicate is paid and found only at audit. With AFC the treasury funds only the cleared payments, and flagged records go to a caseworker.

**Inputs (all used on screen)**

| Input | Type | Default | Effect on the scene |
|-------|------|---------|---------------------|
| Your ministry | text (≤ 26) | Ministry of Welfare | Labels the programme owner circle (both tracks), its callouts and the captions |
| Currency | currency | USD | Currency of every coin, amount and payout caption |
| Monthly budget | amount | 5,000,000 | Opening caption (amount and the number of people it would cover), the pre-funded float and the hold on it |
| Benefit per person | amount | 150 | Per-person amount tags, the duplicate payment, every payment and the bank credit caption |
| Beneficiaries shown | number 2–6 (hint under the field; a value below 2 resets to the default) | 4 | Today: recipient circles plus one duplicate record. With AFC: the count of cleared people in the output caption |
| Permitted use | select (Food, Utilities, School costs) | Food | Merchant drawn (grocery shop, utility company, school supplier), the permitted-use list step and the purchase caption; With AFC, the bank's sub-label |

**Tracks**

- **Today** (38 steps, clock in hours, illustrative). The pre-funded float is a real hold: the money has left the treasury and no one has been paid from it. The shop's wait for settlement is a real wait, drawn as a hold on the shop. The appeal holds one person's payment until a decision. The clock covers the run to the supplementary payment; the audit is drawn outside the clock.
- **With AFC** (5 steps, clock in hours, illustrative). One process in its own space. The treasury, the ministry and the bank sit outside the frame and reach it only through the API gateway. Inside, the source anchor and the payout anchor accept money on their reserves, NodeChain records the proof, and ArosCoin is issued 1 = 1 only after the source anchor accepts the funds. The bank credits cleared people on its own books. There are no holds: the flags are checks by the responsible institution, shown on its own circle.

**Steps**

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

Flags in the With AFC track are checks, not holds. The ministry’s registry flags a duplicate ID and the bank flags a name mismatch. Each flag sits on the flagging institution’s own circle and goes to a caseworker. Nobody is refused.

**What AFC does not do here**

- It does not decide, score or refuse eligibility. The ministry decides on its own registry; AFC carries the signed list and the confirmed payment.
- It never rejects a person automatically. A flagged record goes to a caseworker, and the person keeps the right to appeal. The caseworker review and the appeal take time that the With AFC clock does not include.
- The bank’s name matching and the permitted-use check stay with the bank, on its own data. AFC does not judge purchases and is not drawn in the shop’s transactions.
- It holds no funds. The treasury, the anchors and the bank keep the money on their own books; the anchors accept money on their reserves and never accept requests.
- It has no holds. The With AFC track has no padlock, no HOLD label and no waiting money.
- Pre-funding is one pattern, shown here as an example; programmes differ by country.
- Timings, amounts and the duplicate case are illustrative. The protocol (PoT) fee has no public amount until its tariff is set. NodeChain belongs to AST.
