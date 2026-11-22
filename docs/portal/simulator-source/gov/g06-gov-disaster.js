institutionalScenario({
  "key": "gov-disaster",
  "no": "G06",
  "group": "Commercial",
  "name": "When the beneficiary can use the money",
  "mandate": "An equipment importer instructs a cross-border supplier payment. Measure from bank approval to supplier account credit.",
  "source": "https://www.swift.com/payments/how-long-does-swift-payment-take",
  "assumption": "Swift reports network-wide distributions. The sequence illustrates a corridor and assumes an authorised payout arrangement.",
  "outcome": "Supplier account credited",
  "today": [
    [
      "Approval",
      "The sending bank approves the invoice payment and validates the beneficiary instructions."
    ],
    [
      "Arrival",
      "The payment reaches the beneficiary institution. This event establishes arrival at the bank."
    ],
    [
      "Booking",
      "The receiving bank completes its applicable checks and posts the supplier credit."
    ],
    [
      "Evidence",
      "The posting is matched to the invoice reference. Arrival time and customer credit time can now be compared."
    ]
  ],
  "next": [
    [
      "Approval",
      "The bank performs the same checks and submits the approved mandate to AFC."
    ],
    [
      "Funding",
      "Fiat credit at the relevant anchor is confirmed to AFC before AST starts."
    ],
    [
      "Payout",
      "Following AST completion AFC directs the agreed payout in the invoice currency."
    ],
    [
      "Evidence",
      "The supplier bank confirms the credited amount and invoice reference. This is the same end point as Today."
    ]
  ]
});
