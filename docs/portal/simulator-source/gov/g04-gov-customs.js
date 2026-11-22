institutionalScenario({
  "key": "gov-customs",
  "no": "G04",
  "group": "Digital assets",
  "name": "From a second chain to a USD account",
  "mandate": "A treasury holds native USDC on one network. Its chosen cash-out facility accepts the USDC on another. The mandate ends in USD at its own bank.",
  "source": "https://docs.chain.link/ccip/evm/tutorials/application-developers/usdc",
  "assumption": "Assumes a supported CCIP lane, eligible redemption account and an agreed reverse AFC route.",
  "outcome": "USD credit on the bank statement",
  "today": [
    [
      "Transfer",
      "The treasury instructs a supported USDC transfer to the destination network through CCIP."
    ],
    [
      "Receipt",
      "Destination execution establishes delivery to the designated address on that chain."
    ],
    [
      "Redemption",
      "The eligible institution redeems USDC with its provider and requests a USD wire to its linked account."
    ],
    [
      "Bank credit",
      "The account bank books the incoming dollars. A wire reference alone does not complete this mandate."
    ]
  ],
  "next": [
    [
      "Approval",
      "The bank approves its client's withdrawal mandate and sends it only to AFC."
    ],
    [
      "Asset receipt",
      "CCIP delivers USDC. The crypto anchor confirms actual receipt for this mandate to AFC."
    ],
    [
      "AST event",
      "In this proposed reverse route AFC requests AST issuance against the confirmed asset and receives the completion signal."
    ],
    [
      "Bank credit",
      "The authorised fiat payout is executed and the account bank confirms USD credit. Participants receive their own results."
    ]
  ]
});
