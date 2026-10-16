### G06 — Disaster relief

**Key:** `gov-disaster` · **Buyer:** government / donors · **Effect:** fast targeted payouts · **Main risk:** identity exclusion (people without documents).

Cash support after a disaster. Today pledges, paper lists and bank batches take weeks, and people without documents are left out. With AFC the relief contract is agreed in advance, each institution checks its own data once, and people without ID get an in-person fallback path that a licensed cash-out agent completes against a signed record.

**Inputs (all used on screen)**

| Input | Type | Default | Effect on the scene |
|-------|------|---------|---------------------|
| Your agency | text (≤ 26) | National Relief Agency | Labels the relief fund holder circle, its callout and the captions (both tracks) |
| Affected region | text (≤ 26) | North Valley | Name of the dashed affected-area panel (Today) and of the local authority in the captions (both tracks) |
| Currency | currency | USD | Currency of every coin and amount |
| Relief fund | amount | 2,000,000 | Fund text and amount on hold (Today); anchor legs and payouts (With AFC) |
| Households shown | number 1–6 | 5 | Today: number of house icons drawn in the affected area. With AFC: the count in the captions and the Households paid metric (no house icons, see open points) |
| Of them without ID | number 0–6 (hint: cannot exceed households shown) | 1 | How many carry the NO ID tag (Today) or are counted for the fallback path (With AFC); they are left out today and take the fallback path with AFC |

**Steps — Today (35 steps; 34 when no household lacks ID).** Hours and days are illustrative. The track is one institution-to-institution process: messages, files, paper forms, a queue for clearing, and manual reconciliation.

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

**Steps — With AFC (5 steps).** One process in its own framed space. Institutions sit outside the frame and reach it only through the API gateway. Anchors and NodeChain sit inside. AFC is not drawn; it is named in the captions as the component that receives the request and routes it. The local authority's registration and in-person checks are the institution's own work and are not shortened by AFC.

| # | With AFC |
|---|----------|
| 1 of 5 | **Request.** Each institution checks its own data: the accounts and the households without ID. Through the gateway, AFC routes the confirmed donor transfer to the donor leg. |
| 2 of 5 | **Accept.** The donor-leg anchor accepts the funds on its own reserve. AFC checks the arrived funds against the contract. |
| 3 of 5 | **Issue.** After acceptance, the proof of transaction is recorded in NodeChain (AST). Only then ArosCoin is issued 1 = 1. |
| 4 of 5 | **Accept and convert.** The payout anchor accepts ArosCoin and pays USD, 1 = 1, with no conversion. The local authority checks the no-ID cases in person, over days, and signs the record. |
| 5 of 5 | **Output.** The paying bank credits each confirmed account. Its cash-out agent pays the signed no-ID cases in cash, against the record. Notices leave through the gateway to the donors and the agency. The process ends. |

**What AFC does not do here**

- It does not verify identity or decide who is affected or eligible. The local authority and the agency decide on their own records; a case the official cannot confirm stays open for review, never auto-denied.
- It does not shorten the field work. Door-to-door registration, the in-person identity check and the signed record stay with the local authority and take days.
- It has no holds on the With-AFC track: no padlock and no hold label. Checks are shown on the institution's own circle.
- It holds no funds. Anchors hold their own reserves; each institution settles on its own books. ArosCoin exists only after the transaction is confirmed.
- Cash-out agents act for a licensed bank under its rules; the bank funds them and reports each payout.
- It does not put personal data on NodeChain. The PoT record carries payout confirmations as evidence references only.
- It does not make the donor, agency and bank systems atomic. The links between them are evidence references.
- Timings and amounts are illustrative. The protocol (PoT) fee has no public amount until its tariff is set.

**Open points for the owner**

- The canon gate lists `AFC` as a forbidden word, while the model names it in captions. The fragment follows the model; the gate needs a decision.
- The With-AFC track draws no household icons. At viewBox height 420 with institutions at INST_Y 290, there is no room for an affected-area row under the institution labels; households appear as counts in captions and metrics. Decide whether a households row is wanted; it would need a taller viewBox.
