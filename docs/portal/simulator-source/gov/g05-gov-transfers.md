### G05 — Intergovernmental (inter-budget) transfers

Key `gov-transfers` · group *Government* · registry entry in `gov/g05-gov-transfers.js`.

| | |
|---|---|
| **Buyer** | Ministry of Finance, with the regions |
| **Effect** | Traceability |
| **Main risk** | Politicisation of transfer conditions. Conditions are published as a versioned policy; any change needs a new signed policy version. |

**Today.** The budget law sets the transfers and the ministry must pay them out under the published conditions. The ministry's budget desk splits the allocation by hand, signs paper transfer orders, and posts a paper notice to each regional treasury. It also sends one payment file to the central bank, which pays in the next payment run, after the cut-off and the clearing window. The money reaches each region with a short reference, not the notice number. It sits unallocated (a real hold) until the region matches it by hand to its paper notice and its own budget line. The region that cannot match writes to the ministry by letter; the ministry replies by letter after its legal desk signs. Municipalities report on paper at quarter end, regions retype the reports, and the ministry consolidates summaries that arrive in different formats. Reconciliations run by hand, and the audit office traces payments across three sets of books before it opens follow-ups for money it cannot tie to a use.

**With AFC.** One process in its own space, with the institutions outside it. The conditions are published as a signed policy version. Each region confirms its account, budget line and conditions version on its own records, and the request reaches AFC through the gateway with the funds. The source anchor accepts the funds on its reserve account. After acceptance, the proof of transaction is recorded in NodeChain (AST) and ArosCoin is issued 1 = 1. The payout anchor accepts ArosCoin, and each region is credited on its own books and confirms receipt. The audit view reads the linked chain through the gateway. Municipal use reports, where the conditions allow, are filed through each region as spending happens; they sit outside this clock.

#### Inputs

| Field | Type | Default | Effect on the picture |
|---|---|---|---|
| Your ministry | text (≤ 26) | Ministry of Finance | Labels the paying circle and captions on both tracks |
| Currency | currency | EUR | Coins, hold text, settlement and captions |
| Transfer amount | amount (max 100,000,000,000) | 60,000,000 | Split evenly across regions; per-region hold, payment and settlement captions. Long amounts are shown compactly in holds |
| Regions | number 1–5 | 3 | Number of regional treasury circles on both tracks. Today also draws two municipalities per region; spacing adapts |
| First region | text (≤ 26) | Northern Region | Name of the first regional treasury circle and the captions that mention it. With one region the captions name it in brackets instead of "first" |

#### Steps (default inputs: EUR, 60,000,000, 3 regions)

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

Shown live: simulated clock; on Today, holds and amount on hold, time on hold, paper documents and the untraced item at audit ("part of the funds"); on With AFC, holds (none on this track), proof of transaction, token before acceptance (0), API calls and receipts confirmed.

#### What AFC does not do here

- It does not decide allocations and does not read or interpret the budget law. Transfer conditions are set by law and by the responsible ministry; AFC only publishes them as a signed, versioned policy.
- It does not hold or move money. Anchors hold their own reserves, and each institution settles on its own books.
- It does not replace the regional or municipal ledgers. Each treasury confirms on its own data.
- It does not show a region whose budget line fails. A mismatch is found on that region's own records before the request is sent, and the review belongs to the region and the ministry, not to AFC.
- It does not draw municipalities as separate circles or show their use reports on the track. Those are filed through each region as spending happens, where the conditions allow, outside this clock.
- It does not draw audit conclusions. The audit view shows linked evidence; findings stay with the audit office and parliament.
- It does not remove the time regions need to book and spend. The With AFC clock is in hours and days, and the figures are illustrative.
- It does not set reporting cadence. Reporting dates are set by law and by rules, which vary by country.
- PoT records are made only where the law allows.
- ArosCoin is issued only after acceptance and moves only inside the frame. The payment itself settles on the institutions' own books.
