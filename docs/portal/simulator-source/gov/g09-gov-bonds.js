// Each event highlights the current stage. No settlement time or fee is estimated.
function g09today(T, K) {
  const stages = [
  [
    "Issuance",
    "The issuer establishes the bond terms, nominal amount and maturity."
  ],
  [
    "Allocation",
    "The authorised register records the institutional holder\u2019s position."
  ],
  [
    "Transfer",
    "After a settled transfer, the register updates the holders\u2019 positions."
  ],
  [
    "Coupon",
    "The paying agent uses the applicable record date and confirms the coupon payment."
  ],
  [
    "Redemption",
    "Principal is repaid at maturity. The register records redemption and closes the position."
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
function g09next(T, K) {
  const stages = [
  [
    "Confirmed asset",
    "The issuer provides evidence of the institutional bond, its terms, valuation and authoritative record."
  ],
  [
    "Tokenisation",
    "AST records the confirmed asset in NodeChain and issues ArosCoin according to the agreed equivalent. The tokenised position refers to this bond."
  ],
  [
    "Transfer",
    "AST services the asset and records the confirmed change in the holder\u2019s position, preserving the link to the underlying bond."
  ],
  [
    "Coupon",
    "The paying agent confirms the coupon event. AST links that event to the serviced asset and the relevant position."
  ],
  [
    "Redemption",
    "After confirmed repayment at maturity, AST records the terminal event and ends servicing for the redeemed asset."
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
GOV.push({key:"gov-bonds",no:"G09",group:'Government',name:"Government bond lifecycle",sub:"With AST",inputs:[],lede:"Follow one government bond from confirmed issuance through transfer, coupon and redemption. Both tracks end at maturity.",note:"Reference: Hong Kong\u2019s HKD 800 million tokenised government green bond. HKMA documents issuance, settlement, coupon and redemption. The AST route is an illustrative design and assumes authorised access to issuer and registry confirmations.",today:{tag:"Today",title:"Government bond lifecycle \u00b7 Today",why:"Principal is repaid at maturity. The register records redemption and closes the position.",band:'Stage sequence',vbH:350,unit:'h',build:g09today},next:{tag:"With AST",title:"Government bond lifecycle \u00b7 With AST",why:"After confirmed repayment at maturity, AST records the terminal event and ends servicing for the redeemed asset.",band:'Stage sequence',vbH:350,unit:'h',build:g09next}});
