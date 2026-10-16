### G07 — Aid and grants

**Key:** `gov-aid` · **Buyer:** IFIs / ministries · **Effect:** impact evidence · **Main risk:** privacy and local capacity.

A donor funds a project abroad in tranches. Today each tranche waits on paper approvals, a manual FX conversion, a designated-account hold and reports that carry beneficiaries' personal data across borders. With AFC each tranche follows milestone evidence signed by an independent verifier, and the donor sees results, not personal records.

**Inputs (all used on screen)**

| Input | Type | Default | Effect on the scene |
|-------|------|---------|---------------------|
| Donor or IFI | text (≤ 26) | Development Fund | Labels the donor circle, its callouts and the captions |
| Recipient country | text (≤ 26) | Country A | Name of the dashed recipient-country panel (Today) and of the treasury in the captions |
| Grant currency | currency | USD | Currency of the donor's coins, tracker and amounts |
| Local currency | currency | GEL | Currency after conversion; the converting bank's sub-label; no conversion shown when equal to the grant currency |
| Grant amount | amount | 10,000,000 | Grant total in the tracker, tranche size, hold amount, FX spread |
| Tranches | number 1–4 | 3 | Number of slots in the tracker, number of loops (Today), milestones in the AFC contract. Each later tranche repeats the AFC steps on its own milestone evidence; the tracker counts them, the track animates tranche 1 only |

**Steps**

Today has 36 steps at three tranches. With AFC has five steps, every one of them a single animation call, so the step counter matches the captions "n of 5".

| Stage | Today (36 steps at three tranches; time is illustrative) | With AFC (five steps; tranche 1 animated) |
|-------|-----------------------------------------------------------|--------------------------------------------|
| 1 | Donor's own committee approves the grant, paid in tranches against milestones; the minute is the record (step 1) | 1 of 5 · Request. After a site visit of days the verifier signs milestone 1, and AFC checks the signature. The donor approves tranche 1. AFC routes it to the USD anchor. |
| 2 | Terms are negotiated by e-mail; the signed paper original is couriered; ratification where a country requires it (steps 2–5: agreement, budget line, designated account opened by hand) | 2 of 5 · Accept. The USD anchor accepts the funds on its reserve account. AFC checks them against the request. |
| 3 | Withdrawal application on paper with a progress statement; the donor's fiduciary review; a query for a missing signature, answered by courier; the approval letter is signed on paper (steps 6–10) | 3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1. |
| 4 | Donor's bank sends a payment message; the converting bank screens the payment, quotes its own rate, and converts USD to GEL, keeping its spread (steps 11–15) | 4 of 5 · Accept and convert. The GEL anchor accepts ArosCoin and converts it at the converting bank's quoted rate. The bank keeps its spread. |
| 5 | The batch credit can take a day; the treasury matches it by hand against the approval letter (step 16) | 5 of 5 · Output. The treasury is credited on its own books. The donor gets a notice with signed results and no personal data. The process ends here. |
| 6 | Real hold: the funds wait on the designated account until the ministry of finance and the treasury sign the budget release, in turn (steps 17–19) | — |
| 7 | Payment order goes to the implementing bank through the local clearing system, in its next batch; the bank checks the order under its own rules and credits the project account (steps 20–22) | — |
| 8 | The project runs its own tenders; the donor's no-objection by letter where it is required; the project pays suppliers and beneficiaries from its own accounts (steps 23–25) | — |
| 9 | The project reports on paper, with beneficiary lists attached (names, IDs, addresses); the treasury forwards the report to the donor abroad by e-mail, personal data included (steps 26–27) | — |
| 10 | The donor reviews; questions go back and forth by e-mail, typically for weeks. A query for missing names: the project corrects the lists by hand and resends them, personal data included (steps 28–30) | — |
| 11 | Real hold: the donor withholds the next tranche until it accepts the report; the release follows acceptance (steps 31–32) | — |
| 12 | Tranches 2 and later: the same loop repeats, one step each: application, review, conversion, budget release, another report with names (steps 33–34) | Tranches 2 to k repeat steps 1–5 on their own milestone evidence. They are counted in the tracker and the metrics, not animated. |
| 13 | Years later, outside this clock, an impact audit rebuilds the evidence from reports and site samples; personal data has travelled abroad with every report (steps 35–36) | — |

Tranche 1 is never released before the verifier's signed evidence. With AFC, per tranche: two API calls through the gateway (milestone evidence, approved request) and one PoT record. For three tranches the contract holds three milestones; the track shows tranche 1 and counts the rest.

Layout: Today keeps the dashed recipient-country panel, with the treasury, local bank and project inside it. The With-AFC track has one framed process space with the anchors and NodeChain inside it, and the API gateway strip on its lower edge. The five institutions sit below the gateway: donor, converting bank, treasury, local project and verifier. They reach the process only through the gateway. There are no links between institutions and no holds. AFC is not drawn; the captions name it. The tranche tracker sits at the foot of the With-AFC track. vbH is 470 for Today and 420 for With AFC.

**What AFC does not do here**

- It does not judge the work. The verifier is independent of both sides and signs the evidence; AFC checks the signature and the contract state.
- It does not run the site visit. On-site verification still takes days, and the project work and the final impact evaluation are outside both clocks.
- It does not build local capacity. The project must still be able to collect evidence, and a verifier must be available; the verifier can be a bottleneck.
- It does not hold any funds, and it does not put a hold on any tranche. Conditions are checks that the responsible institution makes on its own circle.
- It does not convert currency. The converting bank quotes the rate and keeps its spread; the GEL anchor converts at that quoted rate.
- It does not release money on the treasury's books, and it does not move the project's payments. The treasury's release to the implementing bank and the project's spending stay outside AFC.
- The Today track assumes that reports carry beneficiary lists (names, IDs, addresses); many donors accept aggregated data, and approval routes vary by country.
- Selective disclosure is by design: the donor receives signed evidence and aggregates, not personal records; the personal data stays with the project in the recipient country.
- Timings, amounts and FX rates are illustrative. The protocol (PoT) fee has no public amount until its tariff is set.

**Open points for the owner**

- The With-AFC track animates one tranche in five steps; tranches 2 to k are counted, not animated. Confirm this reading of "at most five steps".
- The output goes to the treasury's designated account. The implementing (local) bank is therefore not on the With-AFC track, although it is on the Today track.
- The canon firewall (`.github/scripts/canon-gate.sh`) lists AFC as a forbidden term in repository content. The owner's model names AFC in captions, and the build keeps it there. Confirm before this fragment is merged into the repository.
