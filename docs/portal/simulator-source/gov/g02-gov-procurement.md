### G02 — Government procurement with milestone payments

Key `gov-procurement` · group *Government* · registry entry in `gov/g02-gov-procurement.js`.

| | |
|---|---|
| **Buyer** | Treasury (with the procuring agency as contract owner) |
| **Effect** | Milestone-linked payment |
| **Main risk** | Oracle quality and corruption. An independent inspector is mandatory, and nothing is denied automatically: a mismatch or a dispute puts the milestone on hold for a person to review. |

**Today.** Paper acts, an invoice, manual approvals across several departments and a payment run. The supplier asks the procuring agency by letter to commission an acceptance inspection; the agency commissions the independent inspector, whose request joins a queue. The inspector measures the work and signs a paper act. The act and the invoice travel separately, by courier and by post. The legal, finance and budget desks review them in turn; the invoice goes back once for correction. The treasury checks the paper payment order by hand and releases the money at its next payment run. The reservation of the milestone money on the treasury's books is a real hold; the queues are not holds.

**With AFC.** The inspector visits the site (the same physical time as today) and signs the acceptance evidence with an electronic signature the contract recognises. The procuring agency and the treasury confirm on their own records. The confirmed payment reaches AFC through the API gateway, which routes it to the treasury anchor; the anchor accepts the funds on its reserve account. Where the law allows, NodeChain (AST) records the proof of transaction and ArosCoin is issued 1 = 1 inside the process space; the bank-leg anchor accepts it and the supplier's bank is credited on its own books. Notices and a reconciliation record leave through the gateway. The signed contract registration with AFC (milestones, named inspector, policy version) is not drawn as a separate step; see the owner decisions.

#### Inputs

| Field | Type | Default | Effect on the picture |
|---|---|---|---|
| Your treasury | text (≤ 26) | State Treasury | Labels the treasury circle, the reservation and the payment captions |
| Supplier | text (≤ 26) | Northline Builders | Labels the supplier circle and captions |
| Currency | currency | USD | Coins, reservation text, milestone labels |
| Contract value | amount | 12,000,000 | Reserved amount (one milestone), contract strip, captions |
| Milestones | number 1–4 | 3 | Number of segments in the contract strip; the amount per milestone; the closing caption |

Only milestone 1 is played in full. Later milestones are shown on the contract strip as "same route". Contract value is capped at 100,000,000,000.

#### Steps (default inputs: State Treasury, Northline Builders, USD 12,000,000, 3 milestones)

Today track: 39 steps, about 39 d 1 h on the illustrative clock. Every time is an example, not a service level.
With AFC track: 5 steps, about 1 d 2 h 15 min on the illustrative clock. Each row is one animation step; the checks, API calls and coins inside a step play back to back within it, so the step counter matches the captions.

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

Shown live: simulated clock, holds and amount on hold, hold time, paper documents (Today) or proof of transaction and API calls (With AFC), milestones paid. The comparison table adds review rounds for milestone 1 (Today: two, the invoice went back once; With AFC: one pass).

#### What AFC does not do here

- It does not accept the work, measure it or decide that a milestone is complete. The independent inspector signs the evidence; the procuring agency and the treasury confirm on their own records and keep their approvals.
- It does not hold money. The With-AFC track has no holds: no padlock, no hold label. The treasury's reservation stays on its own books, and the anchors accept funds on their reserve accounts without holding them for AFC.
- It does not deny a payment automatically. A mismatch or a dispute is for a person to review. The Today track shows that review as paper; the With-AFC track draws no hold for it.
- It does not remove the site inspection. The physical visit takes the same time in both routes (illustrative: 24 hours).
- It does not change the treasury's payment-run cadence. The With-AFC track assumes the treasury releases payment once the evidence is linked, without waiting for a batch run; payment-run cadence stays the treasury's own.
- It does not erase records. After a payment is final, an error is corrected by a compensating entry, not by deletion.
- Proof of Transaction is recorded only where the law allows. ArosCoin is issued 1 = 1 only after the funds are accepted; it moves only inside the process space, between its internal components, and never between institutions. The state ledger is not drawn; its reconciliation record leaves through the gateway as a notice.
- AFC is not drawn. It is named in the captions only, as the component that receives the request, checks it and routes it.
