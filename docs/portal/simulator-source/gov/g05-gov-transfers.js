institutionalScenario({
  "key": "gov-transfers",
  "no": "G05",
  "group": "Bank treasury",
  "name": "USD across banks to a local SGD account",
  "mandate": "A corporate treasury funds its own SGD account at a third bank in Singapore from a US dollar account in the US.",
  "source": "https://www.dbs.com/newsroom/DBS_and_Kinexys_by_JP_Morgan_launch_industry_first_247_interoperability_solution_for_cross_border_tokenised_deposit_transfers",
  "assumption": "DBS documents the bilateral USD leg. The FX and third-bank leg are model assumptions, as is AFC participation.",
  "outcome": "SGD credited at the third bank",
  "today": [
    [
      "USD transfer",
      "The eligible client moves USD between supported Kinexys and DBS accounts."
    ],
    [
      "FX booking",
      "The treasury agrees a USD/SGD quote with its executing bank and approves the conversion."
    ],
    [
      "Local payment",
      "The paying bank instructs an SGD payment to the third bank using the verified account details."
    ],
    [
      "SGD credit",
      "The third bank posts the SGD credit to the treasury account."
    ]
  ],
  "next": [
    [
      "Mandate",
      "The originating bank approves the request for SGD delivery and submits it to AFC."
    ],
    [
      "Funding",
      "Following fiat anchor account credit, the anchor signals AFC. The approved request alone cannot trigger issuance."
    ],
    [
      "Execution",
      "AFC starts AST on the confirmed amount and terms. Following completion it instructs the agreed SGD payout."
    ],
    [
      "SGD credit",
      "The third bank confirms the local account credit. Neither a USD transfer nor an FX quote closes this request."
    ]
  ]
});
