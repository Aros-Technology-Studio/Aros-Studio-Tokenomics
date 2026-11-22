institutionalScenario({
  "key": "gov-trade",
  "no": "G12",
  "group": "Capital markets",
  "name": "Funding a digital bond purchase in CHF",
  "mandate": "A foreign institution buys a CHF digital bond through an eligible settlement participant using funds held in another currency.",
  "source": "https://www.worldbank.org/en/news/press-release/2024/05/15/world-bank-partners-with-swiss-national-bank-and-six-digital-exchange-to-advance-digitalization-in-capital-markets",
  "assumption": "The IBRD digital CHF issue is documented. Foreign funding, participant access and AFC settlement arrangements are illustrative.",
  "outcome": "Bond position confirmed by custodian",
  "today": [
    [
      "Order",
      "The investor receives an allocation and settlement instructions from the authorised participants."
    ],
    [
      "FX",
      "The investor's bank converts available currency to CHF and funds the designated participant account."
    ],
    [
      "Settlement",
      "The eligible participant settles the bond purchase under the venue rules."
    ],
    [
      "Custody",
      "The custodian confirms the investor's position after securities settlement."
    ]
  ],
  "next": [
    [
      "Order",
      "The same allocation and settlement instructions define how much CHF is required and by when."
    ],
    [
      "Mandate",
      "The authorised institution approves a CHF funding mandate to AFC. Fiat account credit is confirmed before AST issuance."
    ],
    [
      "CHF delivery",
      "After AST completion AFC coordinates CHF delivery to the eligible participant. Funding is distinct from bond delivery."
    ],
    [
      "Custody",
      "The venue settles the purchase and the custodian confirms the same bond position. The issuer controls the issue."
    ]
  ]
});
