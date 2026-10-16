### G10 — Carbon / energy subsidy

Key `gov-carbon` · group *Government* · registry entry in `gov/g10-gov-carbon.js`.

| | |
|---|---|
| **Buyer** | Ministries (energy, environment) |
| **Effect** | Evidence-linked finance |
| **Main risk** | Data and oracle quality. Meter or emissions data is verified by an accredited verifier and is never taken raw. |

**Today.** A company files a paper claim with its own meter data. The registry opens a file, a desk officer checks the forms, the treasury commits the claimed amount on paper, and an accredited verifier makes an on-site check months later. The ministry re-keys the verified figure by hand and finds the gap; the decision waits for a committee, and the payment order waits for a payment run. The company is paid months after the claim.

**With AFC.** The company's meter data goes to its accredited verifier, who checks it on site and signs the measured result. The ministry approves the verified quantity on its own circle, and the treasury checks its own budget line. The confirmed payment reaches AFC through the gateway with the signed result and the approval. Funds are accepted on the treasury-leg anchor's reserve account, proof of transaction goes to NodeChain (AST) only after acceptance, ArosCoin is issued 1 = 1, the payout anchor accepts it, and the company's bank is credited on its own books. AFC checks the verifier's signature and that the verifier is on the rule's accredited list. Where the law allows, NodeChain records the evidence.

#### Inputs

| Field | Type | Default | Effect on the picture |
|---|---|---|---|
| Your ministry | text (≤ 26) | Ministry of Energy | Labels the scheme-owner circle and captions |
| Company | text (≤ 26) | Riverside Steel | Labels the applicant circle, the meter-data panel and captions |
| Currency | currency | EUR | Coins, the budget commitment, the payout amount and the anchor labels |
| Subsidy paid per | select | t CO2e avoided | Switches units between tonnes and MWh in captions, readouts and the claim |
| Rate per unit | number 1–10,000 | 40 | Subsidy per tonne or per MWh: drives the claimed and verified amounts, the commitment and the payout |
| Verified quantity | number 1–10,000,000 | 25,000 | The verified figure: readouts, captions, commitment and payout. The Today claim is illustratively 20% higher (at least one unit higher), to show the gap |

#### Steps (default inputs)

Clocks are illustrative. Today runs for about 111 days in total; the largest waits (desk queue, committee, batch) are examples, not service levels. The With-AFC clock starts with the on-site check, which takes about three days in both routes.

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

Shown live: simulated clock; on Today, commitments active, budget committed now, time committed, paper documents and the claim against the verified data; on With AFC, holds on the track (always 0), API calls and PoT records, paper documents (always 0), token before acceptance (always 0) and the payment state. The meter panel shows raw readings (dashed) against the verified share (filled), and the gap band in red.

#### What AFC does not do here

- It does not measure or certify anything. Meter and emissions data is verified by an accredited verifier, who signs the result; AFC checks the signature and that the verifier is on the rule's accredited list.
- It does not accredit verifiers. Accreditation stays with the national accreditation body.
- It does not approve, deny or hold a claim. The ministry approves on its own circle; a mismatch goes to a person for review and is never denied automatically.
- It does not set the subsidy rule. The ministry does; AFC publishes it as a signed, versioned contract.
- It does not hold money and has no holds on this track: no padlock, no escrow, no waiting. The treasury's budget line and the bank's account are checked on their own books.
- It does not shorten the site check (about three days in both routes), the ministry's own approval, or a committee where the scheme requires one; its meeting date still applies.
- It does not show a dispute. A dispute would stop the file for a second check on the Today track; the With-AFC track does not show one.
- The gap between the claim and the verified data in the Today route is an illustration, not a statistic. Rates, quantities, waiting times and the 20% claim are examples, not scheme terms.
- PoT records are made only where the law allows. ArosCoin is issued 1 = 1 only after the anchor accepts the funds; it moves inside the process space to the payout anchor and is not the payment, which settles in the currency on the bank's own books.
