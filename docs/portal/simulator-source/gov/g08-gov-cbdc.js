institutionalScenario({
  "key": "gov-cbdc",
  "no": "G08",
  "group": "Central bank money",
  "name": "Beyond the wholesale CBDC perimeter",
  "mandate": "An eligible bank holds wholesale digital CHF in the Helvetia pilot and needs conventional CHF for a beneficiary outside the platform.",
  "source": "https://www.snb.ch/en/services-events/digital-services/faq-overview/qas_helvetia",
  "assumption": "Helvetia is a pilot. Exit to a conventional balance and the onward bank payment are modelled subject to the operator's rules. No AFC access to wholesale CBDC is assumed.",
  "outcome": "CHF deposit at the beneficiary bank",
  "today": [
    [
      "Authority",
      "The participant verifies eligibility and obtains instructions for converting its pilot balance to conventional funds."
    ],
    [
      "Conversion",
      "The eligible participant uses the permitted central-bank procedure and reconciles the conventional CHF balance."
    ],
    [
      "Payment",
      "The bank initiates the onward CHF payment using its conventional payment arrangements."
    ],
    [
      "Credit",
      "The receiving bank credits the beneficiary deposit. Its liability is distinct from central bank money."
    ]
  ],
  "next": [
    [
      "Authority",
      "The eligible participant handles the same pilot conversion under the operator's rules."
    ],
    [
      "Mandate",
      "The bank approves delivery of conventional CHF and sends the payment request to AFC."
    ],
    [
      "Funding",
      "Only credited fiat funding confirmed to AFC starts AST. After AST completion AFC instructs the agreed payout."
    ],
    [
      "Credit",
      "The beneficiary bank confirms the CHF deposit. Whether AFC adds value on this corridor requires measurement."
    ]
  ]
});
