institutionalScenario({
  "key": "gov-soe",
  "no": "G11",
  "group": "Bank treasury",
  "name": "Funding a payment before a local cutoff",
  "mandate": "Treasury needs JPY in Tokyo against available GBP in London before its margin payment deadline.",
  "source": "https://www.bis.org/publications/project-agora-shared-programmable-platform-wholesale-cross-border-payments.pdf",
  "assumption": "BIS Figure 19 illustrates matched needs at one correspondent. An AFC route requires available JPY liquidity and an agreed quote. Margin payment is a later transaction.",
  "outcome": "JPY available before the cutoff if timely",
  "today": [
    [
      "Request",
      "One bank requests JPY against surplus GBP. A second bank requests GBP against JPY."
    ],
    [
      "Match",
      "The common correspondent checks both balances, the FX exposure and remaining time."
    ],
    [
      "Book entries",
      "Its London books debit and credit GBP; its Japan books debit and credit JPY between the two banks."
    ],
    [
      "Availability",
      "The bank verifies available JPY against the local deadline. The margin payment is still outstanding."
    ]
  ],
  "next": [
    [
      "Request",
      "The bank approves a request for the required JPY balance and specifies its settlement deadline to AFC."
    ],
    [
      "Liquidity",
      "The proposed route requires an authorised JPY provider, adequate liquidity and a rate acceptable to the bank."
    ],
    [
      "Funding",
      "Confirmed GBP credit at the fiat anchor permits AFC to start AST and, on completion, direct the JPY payout."
    ],
    [
      "Availability",
      "The bank compares the JPY posting time with the deadline. Capital saved and timing advantage are unmeasured."
    ]
  ]
});
