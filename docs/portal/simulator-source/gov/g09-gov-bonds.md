### G09 — Tokenised sovereign bonds

**Key:** `gov-bonds` · **Buyer:** debt management office / CSD · **Effect:** linked evidence of the cash leg and the bond leg; delivery-versus-payment only where both systems support it · **Main risk:** securities law (bond title stays with the registry or CSD).

A foreign investor buys a tokenised sovereign bond. Today the payment route (investor's bank, settlement bank, debt office) and the registry route (debt office, CSD / registry, custodian) run separately, with holds, batches, files, paper and e-mail between them. The debt office matches the two by hand, days later. With AFC one process in its own framed space runs the cash legs on anchors, records the proof in NodeChain, and issues ArosCoin 1 = 1 only after the funds are accepted. The institutions sit outside the frame and reach it only through the API gateway. The bond title stays on the registry's own register; AFC holds no securities and no cash. Delivery-versus-payment runs only where both external systems support conditional settlement; otherwise AFC links the evidence of the two legs and claims no atomicity between them.

**Inputs (all used on screen)**

| Input | Type | Default | Effect on the scene |
|-------|------|---------|---------------------|
| Your debt office | text (≤ 26) | Debt Management Office | Labels the issuer circle on both tracks (shortened to 16 characters on the With AFC circle; the full name stays in the captions and the card title) |
| Foreign investor | text (≤ 26) | Investor Ltd | Labels the investor circle on the Today track and appears in the captions of both tracks; the With AFC track has no investor circle, the investor's bank submits for the investor |
| Investor pays in | currency | USD | Currency of the cash leg, of the Today holds and of the With AFC cash anchor; FX spread basis |
| Bond currency | currency | GEL | Currency after conversion (settlement bank on Today, output anchor on With AFC) and of the output anchor; when it equals the investor's currency the conversion words disappear, and the With AFC track keeps its five steps |
| Purchase amount | amount | 20,000,000 | Amount in captions, on the Today holds, and in the debt office's credited amount in the bond currency (at illustrative rates) |

**Steps**

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

The metric rows on the Today track show the active holds (two at the peak: the investor's bank and the settlement bank), the amount on hold, the time on hold, messages and paper documents, and "Cash before bond" until the bond is credited. The With AFC metric rows show "Holds: none on this track", the proof-of-transaction count, whether the money and the bond are linked by evidence, the illustrative FX spread and the protocol fee ("tariff TBD"). The investor circle carries no badge on the With AFC track.

**What AFC does not do here**

- It does not hold bond title or any securities, and it does not hold cash. The anchors hold only their own reserves. Title stays with the registry or CSD; money moves on the banks' own books.
- It does not guarantee DvP. Where either system cannot do conditional settlement, AFC only links the evidence of the cash leg and the registry's confirmation and does not claim atomicity across them. If one leg fails, the banks and the CSD hold or compensate on their own books; nothing is erased.
- It does not decide investor eligibility, KYC or sanctions status. The investor's bank, the custodian and the registry check on their own data; a flagged case goes to a person at that institution. AFC does not refuse or approve investors.
- It has no holds on the With AFC track: no padlock, no HOLD label, no hold step. Eligibility and the registry's record are checks shown on each institution's own circle.
- It does not remove settlement-day rules or CSD cut-off times. In this example the registry is inside its window; if its window had closed, its record would wait for the next window outside AFC.
- It does not convert currency on the Today track: the settlement bank does, at its own rate. On the With AFC track the output anchor converts ArosCoin at its own illustrative rate.
- Timings, amounts and FX rates are illustrative and practice varies by country. The protocol (PoT) fee has no public amount until its tariff is set. NodeChain belongs to AST.
