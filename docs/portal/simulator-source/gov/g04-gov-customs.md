### G04 — Customs

Key `gov-customs` · group *Government* · registry entry in `gov/g04-gov-customs.js`.

| | |
|---|---|
| **Buyer** | Customs / banks |
| **Effect** | Synchronisation of duty and payment |
| **Main risk** | Trade-data secrecy. Selective disclosure: the bank sees the duty amount and a reference, not the full declaration. |

**Today.** The importer, or its customs broker, files the declaration. Customs checks it for completeness, returns it by e-mail when a page is missing, assesses the duty on its own tariff, and the risk system decides whether the shipment is inspected. The importer's bank pays the duty in its next payment run. The reference is typed by hand and can be wrong or missing, so the money can reach customs' account as an unmatched payment. The importer brings a stamped paper proof to the customs office; customs writes to the importer and asks the bank for a letter, and matches the payment by hand. The goods stay in the yard for the whole loop. That hold is real: customs releases the goods only after it has the duty and its own checks. Where the risk system selects the shipment, the physical inspection takes the same time on both routes.

**With AFC.** The bank and customs each confirm on their own books, and the two confirmations are linked by the declaration ID. The bank pays the duty amount with the ID as the reference; it does not receive the declaration. Customs confirms the ID and the duty on its records. Through the API gateway, the request reaches the process, the source anchor accepts the funds on its reserve account, and after acceptance the proof of transaction is recorded in NodeChain (AST) and ArosCoin is issued 1 = 1. The payout anchor accepts ArosCoin, and customs is credited on its own books. Customs matches the declaration itself and signs the release order. No paper proof travels. The inspection, where selected, takes the same time as today.

#### Inputs

| Field | Type | Default | Effect on the picture |
|---|---|---|---|
| Your customs office | text (≤ 26) | Port Customs Office | Labels the customs circle and captions |
| Importer | text (≤ 26) | Meridian Imports Ltd | Labels the importer's circle and captions |
| Currency | currency | USD | Coins, statement line, captions and the anchor labels |
| Customs value of goods | amount | 800,000 | Customs value in captions; the duty base |
| Duty rate (%) | number 1–40 | 12 | Duty amount in captions, coins and statement (duty = rate × value) |

#### Steps (default inputs)

Today: 35 steps, about 15 d 7 h on the simulated clock (illustrative). With AFC: 5 steps, about 2 d 2 h (illustrative); the physical inspection, where selected, is inside step 5 and takes the same time as on the Today track. The two columns are not matched row by row; each column is numbered on its own.

| # | Today (35 steps, ≈ 15 d 7 h, illustrative) | With AFC (5 steps, ≈ 2 d 2 h, illustrative) |
|---|---|---|
| 1 | A shipment for Meridian Imports Ltd reaches Port Customs Office. It cannot leave the yard until the declaration is filed, the duty is paid and customs releases it. | 1 of 5 · Request. The bank confirms the $96,000 payment under D-77204. Customs confirms the duty on its records. AFC routes the request. |
| 2 | Port Customs Office keeps the goods in its yard. This hold is real: the goods cannot move until customs releases them. | 2 of 5 · Accept. The USD anchor accepts the $96,000 on its reserve account. AFC holds no funds; the anchor does. |
| 3 | Meridian Imports Ltd’s broker calls customs to ask when the goods can be inspected. The call is noted in a diary, not in a system. | 3 of 5 · Issue. After acceptance, AFC instructs NodeChain (AST) to record the proof. ArosCoin is issued 1 = 1 against the confirmed funds. |
| 4 | Meridian Imports Ltd or its customs broker files the declaration: goods, origin, tariff code and value $800,000. Scanned invoice and bill of lading are attached. | 4 of 5 · Accept. The payout anchor accepts ArosCoin. AFC checks its USD reserve. Both legs use USD, so nothing is converted. |
| 5 | Port Customs Office checks the declaration for completeness: fields, codes and attachments. Some of these checks are still made by hand. | 5 of 5 · Output. Customs is credited on its own books, matches D-77204 and signs the release order. Inspection, if selected, takes the same time as today. |
| 6 | The invoice page is missing. Customs returns the declaration by e-mail. Nothing moves until the file is corrected. |  |
| 7 | The broker reads the reason in the e-mail and types a new file. The correction is keyed in by hand, not copied from the old file. |  |
| 8 | Meridian Imports Ltd re-files the declaration with the missing page. In this example the correction takes a day (illustrative). |  |
| 9 | Port Customs Office accepts the file and looks up the tariff code. Duty = 12% of $800,000 = $96,000. The rate is an example. |  |
| 10 | The risk system selects the shipment for physical inspection or lets it through. The selection rules are customs’ own. |  |
| 11 | A duty notice with a payment reference goes to Meridian Imports Ltd, by post or at the counter. It can take a working day or more (illustrative). |  |
| 12 | Meridian Imports Ltd takes the notice to its bank and orders $96,000. The declaration number is typed into the reference field by hand. |  |
| 13 | The bank screens the payer and the payment under its own rules: sanctions, AML checks and the account balance. |  |
| 14 | The bank checks its payment cut-off time. A payment received after the cut-off waits for the next payment run. |  |
| 15 | The bank debits Meridian Imports Ltd and queues the payment. This is not a hold: customs has received nothing yet. |  |
| 16 | The importer sees the debit on its bank statement. The statement shows an amount and a date, not which declaration it paid. |  |
| 17 | The payment waits in a batch for the central bank settlement window. The windows are set by the central bank and vary by country. |  |
| 18 | The payment run sends $96,000 to customs’ account. It is an unmatched payment, not a hold: customs cannot tie it to D-77204 yet. |  |
| 19 | Overnight the treasury sends customs an end-of-day statement file. An officer prints it the next morning. The payment is listed with no declaration number. |  |
| 20 | The bank gives Meridian Imports Ltd a stamped paper proof of payment at its branch. The proof is paper; no system sees it. |  |
| 21 | Meridian Imports Ltd brings the paper proof to the customs office. The goods have been in the yard since they arrived. |  |
| 22 | An officer searches the open declarations for the same amount. Two files are close, and the paper proof alone does not settle the match. |  |
| 23 | Customs writes to Meridian Imports Ltd by post and asks for the bank’s reference. The letter takes a few days to arrive. |  |
| 24 | Meridian Imports Ltd posts a photocopy of its bank receipt. The copy also takes days to arrive (illustrative). |  |
| 25 | The copy is not enough, so the officer asks the bank to confirm the payment in writing. |  |
| 26 | The bank confirms the payment by letter. This takes one or two working days (illustrative). |  |
| 27 | The officer types the declaration number against the payment by hand. The statement line now reads matched. |  |
| 28 | Customs posts a paper receipt for the duty. It is the only written record the importer gets. |  |
| 29 | Where the risk system selected the shipment, officers inspect it physically. The inspection takes the same time on both routes (illustrative: two days). |  |
| 30 | Where the procedure requires it, a senior officer checks the paper file and co-signs it. Files move between desks. |  |
| 31 | Customs signs the release order itself. This decision stays with customs. |  |
| 32 | The hold ends. The goods can leave once the importer holds the release order. |  |
| 33 | The release order goes to Meridian Imports Ltd on paper. Storage charges build up in the yard for every day of the wait (illustrative). |  |
| 34 | The goods leave the yard. The wait covered the notice, the bank, the paper proof and the bank’s letter. |  |
| 35 | Outside this clock: at month end customs and the treasury reconcile their accounts. Some payments are still matched by hand weeks later (illustrative). |  |

Shown live: simulated clock; on Today the value of goods held and the time they are held, paper documents, and when customs sees the payment; on With AFC the API calls, the proof of transaction, the tokens before acceptance (0) and the data shared with the bank. The holding area and the customs bank statement line are drawn on the Today canvas; the process space and the gateway are drawn on the With AFC canvas.

#### What AFC does not do here

- It does not classify goods, value them, assess the duty or release the goods. Customs does each of these on its own data and records.
- It does not remove the physical inspection. Where the risk system selects a shipment, the inspection takes the same time as on the Today track; it is inside step 5.
- It does not show a duty dispute, an appeal or a refusal. Those are customs' decisions on its own records, with human review and the right to appeal. AFC never refuses anyone or anything automatically.
- It does not show the bank the declaration. The bank sees the declaration ID as the payment reference and the duty amount only (selective disclosure); customs sees the whole declaration.
- It does not hold or move money. Each anchor holds its own reserve; the bank and customs settle on their own books. No institution is linked to another on the track, and no money moves between institutions through the process.
- It does not draw ArosCoin between institutions. ArosCoin is issued 1 = 1 only after the funds are accepted, and it moves only inside the process space to the payout leg. No fee is shown: the protocol fee has no amount until its tariff is set.

#### Open points for the owner

- The canon gate (guide §4.8) lists `AFC` among the forbidden words in every file, while the model requires AFC to be named in captions. The captions of this scenario name it; confirm which rule applies.
- The product rule that a dispute puts the process on hold conflicts with the With AFC model, which has no holds. This scenario shows no dispute on the With AFC track.
- Canon rule 6 (ArosCoin never carries a payment) versus the model flow, in which ArosCoin moves from NodeChain to the payout anchor inside the frame. This scenario follows the model.
- `settleStep` and `notify` add one animation step each. To keep five steps, the credit to customs and the two notices are drawn inside step 5.
