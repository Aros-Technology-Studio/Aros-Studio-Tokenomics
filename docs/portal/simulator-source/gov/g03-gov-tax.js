institutionalScenario({
  "key": "gov-tax",
  "no": "G03",
  "group": "Capital markets",
  "name": "From BUIDL to OUSG",
  "mandate": "An eligible manager exchanges a BUIDL position on Ethereum for an OUSG position on Solana. Both tracks assume approved addresses and subscriptions.",
  "source": "https://www.circle.com/pressroom/circle-announces-usdc-smart-contract-for-transfers-by-blackrocks-buidl-fund-investors",
  "assumption": "The Circle exit is a secondary sale. Ondo decides eligibility and issuance. The combined route is illustrative.",
  "outcome": "OUSG credited to the investor",
  "today": [
    [
      "Sale",
      "Eligible holder sells BUIDL shares to Circle for USDC. The transfer changes ownership of the shares."
    ],
    [
      "Proceeds",
      "The manager identifies the received USDC and arranges delivery on the subscription network."
    ],
    [
      "Subscription",
      "Ondo receives funds and applies its subscription terms. A failed subscription leaves a cash position."
    ],
    [
      "Allocation",
      "The authorised issuer records the resulting OUSG position at the approved address."
    ]
  ],
  "next": [
    [
      "Approval",
      "The manager approves exit and subscription terms and submits the combined mandate to AFC."
    ],
    [
      "Sale evidence",
      "The authorised sale facility executes the sale. Its receipt establishes the available proceeds."
    ],
    [
      "Cash delivery",
      "Under the proposed arrangement AFC coordinates delivery of the confirmed proceeds using an authorised network route."
    ],
    [
      "Allocation",
      "Ondo confirms the OUSG allocation. Until then the portfolio change is incomplete, even if the cash arrived."
    ]
  ]
});
