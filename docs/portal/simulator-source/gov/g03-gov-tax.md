### G03 — Taxes and refunds

Key `gov-tax` · group *Government* · registry entry in `gov/g03-gov-tax.js`.

| | |
|---|---|
| **Buyer** | Tax authority / treasury |
| **Effect** | Fast reconciliation |
| **Main risk** | Erroneous automation. Assessment and refund decisions stay with the tax authority; AFC records states and evidence and decides nothing. The taxpayer's appeal path is unchanged. |

**Today.** The company prepares and files its return; the authority checks it and issues the assessment, which goes out by post. The company copies the payment reference by hand into its bank's free-text field. The bank screens the payment, reserves the funds (a real hold) and sends the payment in its next batch. The treasury cannot tell which assessment the money belongs to, so it parks the amount unallocated (a real hold) and sends a receipts list to the authority. Clerks match receipts to assessments by hand; a mistyped reference is flagged, the company is queried, and it posts back a payment slip. A refund is a paper claim that waits in a queue, followed by a paper refund order and the treasury's own payment run. Waiting times are illustrative and labelled as such in the captions (owner research E2 for the reconciliation by hand).

**With AFC.** One process in its own framed space. The taxpayer, the taxpayer's bank, the authority and the treasury sit outside the frame and reach it only through the API gateway. Inside, the payer's anchor accepts the funds on its reserve, NodeChain (AST) records the proof, and ArosCoin is issued 1 = 1 only after that acceptance. The treasury's anchor accepts ArosCoin and the treasury books the payment on its own books. Bank, treasury and authority each confirm on their own records; nothing is held. When the authority signs the refund decision, AFC checks the signature and records it on the trail; the treasury then pays the refund on its own books. Access to the trail follows each party's own legal and confidentiality rules (tax data stays confidential).

#### Inputs

| Field | Type | Default | Effect on the picture |
|---|---|---|---|
| Your tax authority | text (≤ 26) | Revenue Authority | Labels the authority's circle and captions |
| Taxpayer company | text (≤ 26) | Atlas Trading Ltd | Labels the taxpayer's circle and captions |
| Currency | currency | EUR | Coins, anchor labels, hold text, ledger and trail values |
| Tax amount | amount | 1,200,000 | Assessment, payment, hold and ledger amounts |
| Refund claim (% of tax) | number 0–30 | 12 | Refund amount; at 0 the refund steps are left out (Today 30 steps, With AFC 3 steps) |

#### Steps (default inputs)

Today has 40 steps (≈ 110 d 16 h, illustrative). With AFC has 5 steps (≈ 4 d 2 h, illustrative; the authority's own review time is kept). The With-AFC steps are one animation call each, so the viewer's counter matches the captions.

| # | Today (40 steps, ≈ 110 d 16 h) | With AFC (5 steps, ≈ 4 d 2 h) |
|---|---|---|
| 1 | Atlas Trading Ltd must settle €1,200,000 in tax for the period. Its own team closes the books and prepares the return first. | 1 of 5 · Request. Bank, treasury and authority each confirm ID A-48213 on their own records. AFC gets the payment through the gateway and routes it to the payer's leg. |
| 2 | The finance team collects invoices, payroll and bank data, often with an outside accountant. Illustrative: about a week. | 2 of 5 · Accept and issue. The payer's EUR anchor accepts the funds on its reserve. Only then NodeChain records the proof and AST issues ArosCoin 1 = 1. |
| 3 | Atlas Trading Ltd files the return with Revenue Authority, online or on paper, depending on the country and the company. | 3 of 5 · Output. The treasury's anchor accepts ArosCoin and pays out EUR from its reserve, with no conversion. The treasury books it on its own books. |
| 4 | Revenue Authority's intake team logs the return. Figures are keyed into the case system; paper attachments are scanned or retyped. | 4 of 5 · Decision. Atlas Trading Ltd claims €144,000 on ID A-48213. Revenue Authority signs the decision. AFC checks the signature and records it on the trail. It decides nothing. |
| 5 | Figures are matched against third-party reports from banks and employers. Mismatches go to an officer. The rules vary by country. | 5 of 5 · Payout. The treasury pays €144,000 on its own books and the bank credits Atlas Trading Ltd. Atlas Trading Ltd is notified through the gateway. The process ends. |
| 6 | An officer reviews the flagged items and works out the tax due: €1,200,000. Review time is illustrative: days or weeks. | |
| 7 | Revenue Authority issues the assessment under ID A-48213. The decision stays with the authority and can be appealed within the period set by law. | |
| 8 | The assessment notice goes out by post, with a payment reference printed in the letter. Illustrative: several days in the post. | |
| 9 | Atlas Trading Ltd's tax team reads the notice and checks the amount against its own calculation. | |
| 10 | The reference is copied by hand into the bank's free-text field. One typo later leaves the payment unallocated. | |
| 11 | Atlas Trading Ltd orders its bank to pay €1,200,000 by internet banking. The assessment number is typed into a free-text field. | |
| 12 | The bank screens the payer and the payment under its own AML and sanctions rules. Minutes to hours. | |
| 13 | The bank reserves €1,200,000 on the company's account until its next payment batch. This is a real hold of funds. | |
| 14 | The company's statement shows the amount as reserved, so the payment looks made. Nothing has reached the treasury yet. | |
| 15 | The bank's operations team applies its cut-off time. A payment after cut-off waits for the next batch. | |
| 16 | The bank sends the payment in its next batch to the national payment system. The reference is free text, so no assessment ID travels with it. | |
| 17 | The treasury cannot tell which assessment the money belongs to. It parks the amount in a suspense account, unallocated. This is a real hold of funds. | |
| 18 | The treasury's cash office books the receipt, unallocated, and prepares a receipts list for Revenue Authority. | |
| 19 | The treasury sends its receipts list to Revenue Authority, days later, as a file. The file has an amount and a free-text reference only. | |
| 20 | One line fails the import because of a stray character. A clerk retypes it by hand, which takes another day. | |
| 21 | Clerks at Revenue Authority match each receipt to an assessment by hand: reference, amount and taxpayer name. Illustrative: several days. | |
| 22 | The reference "A-4813" matches no open assessment: one digit is missing. The clerk does not guess. The case is flagged for review. | |
| 23 | Revenue Authority writes to Atlas Trading Ltd and asks for the payment slip. The letter goes by post. | |
| 24 | Atlas Trading Ltd phones the helpline. It sees the bank's payment date, not the treasury's receipt, so it cannot close the case. | |
| 25 | Atlas Trading Ltd asks its bank for a copy of the payment slip. Some banks need a signed request form. | |
| 26 | The bank looks up the transfer in its own system and prints a payment slip. Illustrative: one to two business days. | |
| 27 | The slip is handed over at the branch or posted to the company. | |
| 28 | Atlas Trading Ltd copies the slip and posts it to Revenue Authority. The slip carries the assessment ID, which the receipt does not. | |
| 29 | With the slip in hand the clerk matches all three. The treasury allocates the money and Atlas Trading Ltd's account shows "paid". Illustrative: about four days. | |
| 30 | Revenue Authority's portal shows the assessment as paid the next day, after its nightly update. | |
| 31 | Later, Atlas Trading Ltd claims a refund of €144,000 (12% of the tax) on a paper form, with copies of the slip and the assessment. Illustrative: a month or more. | |
| 32 | The paper claim is posted to the authority and logged. It joins a queue with other claims. | |
| 33 | The claim waits in the queue. An officer later searches the archive for the payment evidence. Illustrative: weeks. | |
| 34 | The officer asks Atlas Trading Ltd to confirm its bank account for the refund, by post. | |
| 35 | The company posts back the signed account form. Its details are checked against the bank records by hand. | |
| 36 | The officer pulls the file, finds the payment evidence and checks it against the claim and the assessment. | |
| 37 | The officer signs the refund decision. A paper refund order goes to the treasury. Atlas Trading Ltd can still appeal the decision. | |
| 38 | The treasury checks the order against its budget limits and queues it for the next payment run. | |
| 39 | The treasury pays the refund to the company's bank in its next payment run. | |
| 40 | The bank credits Atlas Trading Ltd with €144,000. The refund arrives long after the payment. | |

Shown live: simulated clock, holds and amount on hold, hold time and paper documents (Today), or API calls · PoT records, the refund decision state and the matched-by-hand count (With AFC). The reconciliation desk, the refund queue and the holds (Today) and the anchors, NodeChain and the gateway (With AFC) are drawn on the canvas. With the refund at 0, Today runs steps 1–30 and With AFC runs three steps: step 3 then reads "3 of 3 · Output. The treasury’s anchor accepts ArosCoin and pays out EUR, with no conversion. The treasury books it. Atlas Trading Ltd is notified through the gateway."

#### What AFC does not do here

- It does not assess tax, approve a refund or deny one. Assessment, refund decisions and appeals belong to the tax authority.
- It does not change the taxpayer's right to object or appeal; a signed decision is the authority's act.
- It holds no funds. The payer's anchor accepts the funds on its own reserve account; the bank and the treasury settle on their own books. The refund is paid by the treasury on its own books after the decision is recorded; no anchor route is drawn for it.
- It does not remove the authority's own review time; the With AFC clock is in hours and days, and the review time is illustrative.
- It does not publish tax data: access to the trail follows each party's own legal and confidentiality rules.
- No institution is linked to another institution or to an internal part of the frame; each reaches the process only through the gateway.
- The hold rows count only holds caused by waiting for another party; there are no holds on the With-AFC track.
- ArosCoin is issued 1 = 1 only after the payer's anchor accepts the funds, and it moves only between the two anchors inside the frame. The money itself settles on the anchors' and institutions' own books. PoT is recorded as a signal to NodeChain.

#### Open points for the owner

- The With-AFC payment route has five model steps (request, accept, PoT and issue, output anchor, output). The track shows them as three captioned steps (accept and issue are one step; the output anchor and the treasury's books are one step). The refund route is two steps. Confirm this compression.
- The canon gate lists `AFC` as a forbidden word, while the model names it in captions. The fragment follows the model; the gate needs a decision.
- The model moves ArosCoin between anchors; the guide's rule "ArosCoin never carries a payment" says otherwise. Confirm which applies to government scenarios.
