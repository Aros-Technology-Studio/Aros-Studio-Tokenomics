institutionalScenario({
  "key": "gov-carbon",
  "no": "G10",
  "group": "Capital markets",
  "name": "Fund proceeds into a GEL account",
  "mandate": "An eligible investor redeems a position in a tokenised Treasury fund and needs the proceeds in a Georgian lari account.",
  "source": "https://ondo.finance/blog/ondo-jpmorgan-mastercard-ripple-tokenization",
  "assumption": "Ondo documented a specific USD redemption to Singapore. The extension to GEL and the AFC arrangements are modelled.",
  "outcome": "GEL proceeds credited",
  "today": [
    [
      "Redemption",
      "The authorised holder requests redemption. The fund applies its terms and confirms the proceeds."
    ],
    [
      "USD settlement",
      "The cash settlement provider delivers USD using the agreed banking instructions."
    ],
    [
      "Conversion",
      "The investor's bank converts available USD at the agreed USD/GEL quote."
    ],
    [
      "Local credit",
      "The account bank confirms the GEL credit and the investor reconciles it to the redemption."
    ]
  ],
  "next": [
    [
      "Mandate",
      "The manager verifies redemption eligibility and approves delivery of the proceeds into the specified GEL account."
    ],
    [
      "Redemption",
      "The fund processes the redemption through its own interface and determines the payable proceeds."
    ],
    [
      "Funding",
      "The fiat anchor confirms actual funding to AFC. AST completes on those terms before AFC directs the GEL payout."
    ],
    [
      "Local credit",
      "The authorised bank confirms the GEL deposit. The fund retains control over its share register."
    ]
  ]
});
