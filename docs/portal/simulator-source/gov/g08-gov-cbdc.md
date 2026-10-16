### G08 — CBDC and bank deposits

**Key:** `gov-cbdc` · **Buyer:** central bank / banks · **Effect:** interoperability · **Main risk:** monetary and legal finality.

A bank moves value between its deposit ledger and the central bank's CBDC ledger. Today the two ledgers keep separate hours, a prefunded settlement account sits idle when money moves to CBDC, and the two sides are reconciled by hand through messages, a channel queue, files and e-mail. With AFC one process coordinates both legs inside its own process space, each leg settles on its own books, and the legs are linked by evidence. CBDC stays a liability of the central bank and deposits stay liabilities of the bank. No atomic settlement across the two systems is claimed.

**Inputs (all used on screen)**

| Input | Type | Default | Effect on the scene |
|-------|------|---------|---------------------|
| Your bank | text (≤ 26) | Bank A | Labels the commercial-bank circle in both tracks, the deposit ledger card (Today), the stamp title, the captions, and the deposit anchor's leg in With AFC |
| Central bank | text (≤ 26) | Central Bank | Labels the central-bank circle in both tracks, its stamp, the CBDC ledger card (Today), and the captions, including the "closed until 09:00" wait |
| Direction | select | Deposit → CBDC | Which leg is the source. Deposit → CBDC: prefunding through RTGS in the afternoon, the bank's block on its deposit ledger, the central bank issues CBDC, the bank's debit posts last (39 Today steps). CBDC → Deposit: no prefunding, the central bank's own block on CBDC in the bank's wallet, the central bank redeems, the bank's credit posts last (37 Today steps). With AFC the queue moves to the source leg |
| Currency | currency | EUR | Coin face colour, the amounts in captions, and the entries on both ledger cards |
| Amount | amount | 5,000,000 | Amount in captions, on the Today block or hold, and in the ledger entries (compact form on the cards) |

Timings are illustrative. The request is at 17:30; the CBDC ledger is closed at 17:00 and reopens at 09:00, so the instruction waits about 15 h 30 min. The bank's own ledger runs to 18:00. In Today the process ends about two days later, when the overnight batch releases the block (about T+2d 15h 30m, illustrative). With AFC the track ends at about 15 h 30 min, when the output leg is open.

**Steps — Today (39 steps, Deposit → CBDC)**

Captions show the default names. The track starts at 17:30 for the request. Steps 1–2 are earlier that afternoon and have no clock time of their own.

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

**Steps — Today, CBDC → Deposit (37 steps)**

The track is the same as above with these differences:
- Steps 1–2 of the Deposit → CBDC list (the prefunding) are absent.
- Step 1 is "At 17:30 Bank A asks to move €5,000,000 from the CBDC ledger back to its deposit ledger. Two ledgers, two sets of hours." Step 2 checks the available CBDC balance in the bank's wallet: "Bank A checks the request on its own books: available CBDC balance in its wallet and daily limit."
- The bank's block on its deposit ledger (step 8 of the Deposit → CBDC list) is absent. In its place, after the central bank's approval, the central bank blocks the CBDC in the bank's wallet (step 13): "Central Bank blocks €5,000,000 of CBDC in the bank's wallet until the redemption is booked."
- Step 14 is "Central Bank redeems €5,000,000 of CBDC on its own ledger and retires it from circulation. CBDC is a liability of the central bank." The central bank's block is released when the redemption is booked.
- Step 19: "The bank marks the redemption as received. Its deposit credit stays open until the books agree."
- Step 22: "The evening batch posts the redemption leg to the general ledger. The bank's ledger is closed for the day."
- Step 34: "Finance posts the deposit entry in the general ledger as a manual journal. The controller signs; the printout is filed, as is typical."
- Step 37 (last): "Next morning the overnight batch credits the deposit ledger. In this example that is about two days after the request."
- Every other step keeps the wording of the Deposit → CBDC list. Only the numbering differs, because the prefunding pair is removed and the central bank's block is added (37 steps in total).

**Steps — With AFC (5 steps)**

One process in its own framed space. The two institutions sit outside the frame and reach it only through the API gateway. Inside the frame are the deposit anchor (left, under the bank), NodeChain, and the CBDC anchor (right, under the central bank). AFC is not drawn; it is named in the captions as the component that receives the request and routes it. The bank's checks and the central bank's checks are shown on each institution's own circle. There are no holds on this track: no padlock and no HOLD label. The "closed until 09:00" note is a status, not a hold.

| # | With AFC (Deposit → CBDC) | With AFC (CBDC → Deposit) |
|---|---------------------------|---------------------------|
| 1 of 5 | 1 of 5 · Request. The bank runs its own checks, then sends one confirmed instruction and its funds through the gateway. AFC routes it to the deposit leg. | 1 of 5 · Request. The bank runs its own checks, then sends one confirmed instruction through the gateway. AFC routes it to the CBDC leg. |
| 2 of 5 | 2 of 5 · Accept. The deposit anchor accepts the funds on its own reserve account. AFC checks them against the instruction, and the transaction is confirmed. | 2 of 5 · Accept. The CBDC leg is closed until 09:00. At 09:00 the central bank checks permission, limit and availability; the CBDC anchor accepts the funds on its reserve. |
| 3 of 5 | 3 of 5 · Issue. After acceptance, the proof goes to NodeChain and AST issues ArosCoin 1 = 1. The CBDC leg is closed until 09:00, so the process waits. | 3 of 5 · Issue. After acceptance, the proof goes to NodeChain and AST issues ArosCoin 1 = 1. No token exists before the funds are accepted. |
| 4 of 5 | 4 of 5 · Accept and convert. At 09:00 the central bank checks permission, limit and availability. The CBDC anchor accepts ArosCoin and converts it 1 = 1. | 4 of 5 · Accept and convert. The deposit anchor accepts ArosCoin and converts it 1 = 1. The bank checks its own deposit account and limit. |
| 5 of 5 | 5 of 5 · Output. Each ledger books its own leg: the bank is debited, the central bank issues CBDC. Notices go out. The process ends. | 5 of 5 · Output. Each ledger books its own leg: the central bank redeems CBDC, the bank is credited. Notices go out. The process ends. |

The clock runs through the wait inside the step that holds it: step 3 for Deposit → CBDC and step 2 for CBDC → Deposit. Each step is one animation with one caption, so the step counter matches the captions.

**Comparison rows**

| Measure | Today | With AFC |
|---------|-------|----------|
| Prefunding rule | prefunded, amount idle (Deposit → CBDC) or none | set by the central bank |
| Matching between ledgers | manual, back office by e-mail | linked by evidence (shown only at the end of the output step) |

**What AFC does not do here**

- It does not issue, redeem, debit or credit CBDC or deposit money. The central bank books CBDC and the bank books deposits; each settles on its own books. There is no common money.
- It holds no funds. The anchors accept money on their own reserve accounts. ArosCoin is a 1 = 1 process token issued only after acceptance; it does not carry the payment.
- It does not make the two systems one atomic process. The legs are linked by evidence in NodeChain. A failed leg would be held or compensated in its own ledger, never erased.
- It does not extend any ledger's operating hours. The CBDC leg waits until 09:00, as it does today. The wait is a status and a clock, not a hold.
- It does not set limits, permissions, reserves, prefunding or collateral. They stay with the central bank; its checks run on its own ledger and are shown on its own circle.
- It does not remove the bank's or the central bank's own checks (balance, limit, AML screening, approvals) or each institution's own reconciliation. It only links the evidence of the two legs.
- It does not replace the central bank's RTGS, the bank's core system or the AML screening, which stay with the institutions.
- Timings, hours, amounts and the typical practices in the Today track are illustrative and vary by country and by central bank. The protocol (PoT) fee has no amount until its tariff is set.

**Open points for the owner**

- The canon gate lists `AFC` as a forbidden word, while the model names it in captions. The fragment follows the model; the gate needs a decision (same point as G06).
- The model has AST issue ArosCoin 1 = 1 right after acceptance. On Deposit → CBDC that token therefore sits in NodeChain for about 15 h until the CBDC leg reopens (AFC step 3). Confirm this is acceptable, or whether issuance should wait until the output leg is open.
- The note says AFC issues no CBDC and no deposit money, and that ArosCoin is a process token. The brief's wording "AFC issues nothing" was narrowed to that. Confirm the wording.
- Both institutions receive a gateway notice in AFC step 5. Confirm whether the central bank should receive one.
- The Today practices (four-eyes, dual control, RTGS prefunding, batch posting, e-mail matching, a formatting error in one extract) are illustrative and labelled as such. They are not checked against any specific central bank. Each needs a source or an "in this example" label before it is presented as typical.
