// Each event highlights the current stage. No settlement time or fee is estimated.
function g02today(T, K) {
  const stages = [
  [
    "Approved invoice",
    "Public buyer verifies the signed acceptance, supplier and EUR invoice amount."
  ],
  [
    "Payment mandate",
    "The authorised institution verifies the supplier\u2019s bank instructions and approves payment."
  ],
  [
    "Currency exchange",
    "The executing bank quotes the USD funding required to deliver the invoiced EUR amount."
  ],
  [
    "Credit",
    "The recipient bank credits the approved supplier."
  ],
  [
    "Reconciliation",
    "The buyer matches the bank confirmation against the invoice and contract milestone."
  ]
];
  stages.forEach(([label, caption], index) => {
    const node = makeNode(T, {x:110 + index * 195, y:180, label, sub:String(index + 1)});
    K.stamp(node, ['Confirmed'], caption, 0);
  });
  T.rows = () => [['Stage', String(Math.min(T.idx + 1, stages.length))], ['Stages', String(stages.length)]];
  T.summary = () => [['Outcome', stages[stages.length - 1][0]], ['Elapsed time and costs', 'Not estimated']];
  T.doneText = stages[stages.length - 1][1];
}
function g02next(T, K) {
  const stages = [
  [
    "Approved invoice",
    "The same acceptance and supplier checks are complete. The institution submits the EUR payment request only to AFC."
  ],
  [
    "Fiat account",
    "AFC routes the request to the fiat anchor. Once the USD funds are credited to its account, the confirmation returns to AFC."
  ],
  [
    "AST issuance",
    "AFC starts AST with the confirmed amount, data and conditions. AST records proof and issues ArosCoin under those terms."
  ],
  [
    "Completion signal",
    "AST signals completion to AFC. AFC routes the instruction for the EUR payment. This fiat route assumes an authorised EUR settlement arrangement."
  ],
  [
    "Credit",
    "The supplier receives the invoiced EUR amount. The proposed buyer-facing receipt links the credit to the invoice. Internal routing is not visible to the buyer."
  ]
];
  stages.forEach(([label, caption], index) => {
    const node = makeNode(T, {x:110 + index * 195, y:180, label, sub:String(index + 1)});
    K.stamp(node, ['Confirmed'], caption, 0);
  });
  T.rows = () => [['Stage', String(Math.min(T.idx + 1, stages.length))], ['Stages', String(stages.length)]];
  T.summary = () => [['Outcome', stages[stages.length - 1][0]], ['Elapsed time and costs', 'Not estimated']];
  T.doneText = stages[stages.length - 1][1];
}
GOV.push({key:"gov-procurement",no:"G02",group:'Government',name:"Cross-border public contract payment",sub:"With AFC",inputs:[],lede:"A public buyer has approved an invoice for imported equipment. Compare delivery of the same EUR payment to the same supplier. Both tracks begin after acceptance of the goods. The USD funding amount depends on the executing institution\u2019s quote.",note:"The World Bank Disbursement Handbook documents direct payments to contractors at a borrower\u2019s request. This fictional currency corridor illustrates that purchasing need. Participation, permissions, rates and costs require actual agreements.",today:{tag:"Today",title:"Cross-border public contract payment \u00b7 Today",why:"The buyer matches the bank confirmation against the invoice and contract milestone.",band:'Stage sequence',vbH:350,unit:'h',build:g02today},next:{tag:"With AFC",title:"Cross-border public contract payment \u00b7 With AFC",why:"The supplier receives the invoiced EUR amount. The proposed buyer-facing receipt links the credit to the invoice. Internal routing is not visible to the buyer.",band:'Stage sequence',vbH:350,unit:'h',build:g02next}});
