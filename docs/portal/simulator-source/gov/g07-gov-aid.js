institutionalScenario({
  "key": "gov-aid",
  "no": "G07",
  "group": "Government",
  "name": "Release of a conditional budget tranche",
  "mandate": "A funding authority approves a tranche after the programme authority verifies its conditions. Treasury needs confirmation of the credited amount.",
  "source": "https://www.consilium.europa.eu/en/policies/ukraine-facility/",
  "assumption": "The EU facility illustrates conditional approval. The payment corridor and receiving currency are illustrative.",
  "outcome": "Treasury account credited",
  "today": [
    [
      "Eligibility",
      "The programme authority assesses the agreed milestones and documents the amount eligible for release."
    ],
    [
      "Authority",
      "The funding authority authorises that tranche and provides the receiving treasury account details."
    ],
    [
      "Payment",
      "The executing institution releases funds by the agreed banking route."
    ],
    [
      "Receipt",
      "The treasury reconciles its account credit against the tranche authorisation."
    ]
  ],
  "next": [
    [
      "Eligibility",
      "The programme authority verifies the same milestones. Its decision remains the basis of the release."
    ],
    [
      "Mandate",
      "The authorised institution verifies amount and beneficiary and submits its approved mandate to AFC."
    ],
    [
      "Delivery",
      "Confirmed fiat funding triggers AFC's request to AST. After AST completion AFC directs the agreed treasury payout."
    ],
    [
      "Receipt",
      "The treasury matches actual credit to the authorised tranche. Subsequent spending requires separate evidence."
    ]
  ]
});
