/* ================= G09 · Tokenised sovereign bonds ================= */
// Today: a payment route and a registry route that run separately. Each institution checks on its own books; the hand-offs are messages, files, batches and paper; the debt office matches the two by hand.
// With AFC: one process in its own framed space. Institutions sit outside it and reach it only through the API gateway. Five steps: the cash legs run on anchors, NodeChain records the proof and AST issues ArosCoin. The bond title stays with the registry. No holds.
// Illustrative: hours, waits and amounts are examples. Typical practice varies by country; no step is presented as a universal rule.
function g09Vars(T){
  const v = T.cfg.v, {from, to, amount} = T.cfg;
  const rf = RATES[from], rt = RATES[to], toAmt = rf && rt ? amount*rt/rf : null;
  return {org: v.org || 'Debt Management Office', inv: v.inv || 'Investor Ltd', from, to, fx: from !== to, amount, amt: money(amount, from), bAmt: toAmt == null ? null : money(toAmt, to)};
}
function g09Short(s, n=20){ return s.length > n ? s.slice(0, n - 1) + '…' : s; }
// A pill that states the gap between the two routes (red) or its closure (green).
function g09Banner(T, x, y, w){
  const g = svgEl('g', {opacity:0}, T.layers.fx);
  const r = svgEl('rect', {x:x - w/2, y:y - 15, width:w, height:30, rx:15, fill:'#FFFFFF', stroke:C.hold, 'stroke-width':1.5}, g);
  const t = svgEl('text', {x, y:y + 4.5, 'text-anchor':'middle', 'font-size':12.5, 'font-weight':700, 'letter-spacing':1.4, fill:C.hold}, g);
  return {set(text, p, ok){ if (t.textContent !== text) t.textContent = text; const col = ok ? C.ok : C.hold; r.setAttribute('stroke', col); t.setAttribute('fill', col); g.setAttribute('opacity', p); }};
}
// One With-AFC step: several sub-animations (checks, badges, coins, notices) run inside one caption, so the step counter matches the captions.
function g09Beat(T, K, cap, sim, fill){
  const outer = T.steps, S = kit(T), parts = T.steps; T.steps = outer;
  fill(S);
  const total = parts.reduce((a, s) => a + s.dur, 0);
  let acc = 0;
  const seq = parts.map(s => { const a = acc/total; acc += s.dur; return {s, a, b:acc/total, on:false, off:false}; });
  K.add({dur:total, sim, cap, run:p => {
    seq.forEach(q => {
      if (q.off || p < q.a) return;
      if (!q.on) { q.on = true; q.s.start && q.s.start(); }
      const t = seg(p, q.a, q.b);
      q.s.run && q.s.run(t);
      if (t >= 1) { q.s.end && q.s.end(); q.off = true; }
    });
  }});
}

function g09Today(T, K){
  const {org, inv, from, to, fx, amt, bAmt} = g09Vars(T), so = g09Short(org), usdAmt = T.amountUSD;
  // Investor and debt office are visible from the start; the banks, the custodian and the registry appear when the first message or file reaches them.
  const I   = makeNode(T, {x:110, y:300, r:44, label:inv, sub:'Foreign investor'});
  const IB  = makeNode(T, {x:300, y:175, r:38, label:'Investor’s bank', sub:'Payer', hidden:true});
  // The padlock sits above the bank, clear of the circle and of the debt office card.
  const SB  = makeNode(T, {x:700, y:175, r:38, label:'Settlement bank', sub:fx ? 'Cash leg · FX' : 'Cash leg', hidden:true, lockAt:[-62, -68]});
  const D   = makeNode(T, {x:870, y:300, r:46, label:org, sub:'Issuer · debt office'});
  const CU  = makeNode(T, {x:300, y:372, r:36, label:'Custodian', sub:'Holds for investor', hidden:true});
  const CSD = makeNode(T, {x:700, y:372, r:36, label:'CSD / registry', sub:'Bond title', hidden:true});
  const ban = g09Banner(T, 500, 300, 290);
  const coins = makeCoins(T.layers.tokens, from, 4, IB.x, IB.y + 16, 0);
  T.holdAmount = T.cfg.amount; T.m.gap = false;

  // Order and allotment, on the debt office's own books
  K.pulse(I, `${inv} orders ${amt} of ${org}’s tokenised bonds. The money and the bond will travel on two separate routes.`);
  K.check(D, `${org} checks the order against the auction allotment and the bond series, on its own books.`, 1);
  K.stamp(D, ['Order allotted', 'Series open'], `${org} allots the bonds to ${inv} in its own system.`, .2, so);

  // Payment route, day 0: the investor's bank checks, blocks the amount and misses the cut-off
  K.travel(I, IB, makeEnvelope(T.layers.tokens, 1, 'PAYMENT ORDER'), `${inv} instructs its bank, through its online channel, to pay ${amt} to the debt office. The order is a message.`, 2, {count:'msgs'});
  K.check(IB, `The investor’s bank screens the payer and the beneficiary for sanctions and AML, and checks its ${from} FX line, on its own systems.`, .3);
  K.hold(IB, amt, `The bank blocks ${amt} on the client’s account while the payment is queued. The block is real: other payments cannot use the amount.`, .1);
  K.add({dur:1100, sim:14, cap:'The payment misses the same-day cut-off and waits overnight for the next settlement window (illustrative: about 14 hours).'});

  // Payment route, day 1: the message, the settlement bank's own checks, its earmark and the conversion
  K.travel(IB, SB, makeEnvelope(T.layers.tokens, 1, 'PAYMENT MSG'), `At the morning window the payment message goes to the settlement bank${fx ? ` in the ${to} market` : ''}. Each bank keeps its own ledger.`, .3, {count:'msgs'});
  K.check(SB, 'The settlement bank checks liquidity, sanctions on the debt office’s account and the payout route, on its own systems.', .3);
  K.hold(SB, amt, 'The settlement bank earmarks liquidity for the payout. The earmark is real: that liquidity is not available to its other clients.', .1);
  K.check(SB, fx ? `The FX desk executes ${from} → ${to} at its own rate, within its own limits. The conversion is the settlement bank’s decision.` : `No conversion is needed. The settlement bank confirms the payout in ${to}.`, .2);
  K.coins(coins, IB, SB, `The funds move to the settlement bank${fx ? `, which converts ${from} into ${to}` : ''}. It takes its fee${fx ? ' and the FX spread' : ''}.`, .6,
    {fee:`−${usd(FEE.corr)}`, arrive:() => { if (fx) { coins.recur(to); SB.setFlash(.6); setTimeout(() => SB.setFlash(0), 260); } },
     end:() => { T.addFee(FEE.corr); if (fx) T.addFee(usdAmt == null ? null : usdAmt*FEE.spread); }});
  K.coins(coins, SB, D, `The settlement bank credits the debt office’s treasury account${bAmt ? `: about ${bAmt}` : ''}. The credit posts in the settlement cycle.`, .3);
  K.travel(SB, D, makeEnvelope(T.layers.tokens, 1, 'ADVICE'), 'A payment advice goes to the debt office by message. It carries the payment reference, not the bond.', .1, {count:'msgs', bend:-40});
  K.travel(SB, IB, makeEnvelope(T.layers.tokens, 1, 'CONFIRM'), 'The settlement bank confirms the payment to the investor’s bank by message. Only this confirmation lets the investor’s bank release its block.', .2, {count:'msgs', bend:-55});
  K.release(IB, 'The investor’s bank releases its block and posts the debit on the client’s account. The client’s money has left its books.', .1);
  K.release(SB, 'The settlement bank releases its earmark once the payout is booked. The liquidity returns to its own pool.', .1);
  K.add({dur:900, sim:.5, cap:'The cash is booked on day 1. The bond has not moved, and nothing links the payment to the registry.', run:p => ban.set('PAID · BOND NOT DELIVERED', ease(p)), end:() => { T.m.gap = true; }});

  // Registry route: a file package, a queue, a query to the custodian, and a person for the exception
  K.travel(D, CSD, makeDoc(T.layers.tokens, 'ALLOTMENT'), `Separately, ${org} sends the allotment to the registry as a file package, in the afternoon batch. Nothing ties it to the payment.`, 3, {count:'docs'});
  K.check(CSD, 'The registry checks the investor’s account and eligibility in its own queue. Such queues are often run in batches; this one waits for the next batch.', 14);
  K.badge([[CSD, 'fail']], 'The registry cannot match the investor to a securities account and queries the custodian. This is a case for a person, not a payment hold.', .3);
  K.travel(CSD, CU, makeDoc(T.layers.tokens, 'ACCOUNT QUERY'), 'The query goes to the custodian as a document, by secure e-mail. There is no system-to-system call.', 4, {count:'docs'});
  K.check(CU, 'The custodian checks the investor’s account details against its own records and prepares an answer. Its own cut-off applies.', 6);
  K.travel(CU, CSD, makeDoc(T.layers.tokens, 'ACCOUNT INFO'), 'The answer returns to the registry as a document. The registry keys the account number into its register by hand.', 3, {count:'docs', burn:false});
  K.check(CSD, 'The registry checks the keyed account number a second time. Nothing is posted automatically.', .5);
  K.badge([[CSD, 'ok']], `The registry registers ${inv} as holder through the custodian. Bond title stays in the register.`, .3);
  K.add({dur:700, sim:0, cap:'The bond is credited on the registry’s books. The debt office has not been told, and cash and bond are still not matched.', run:() => ban.set('BOND CREDITED · NOT MATCHED', 1, false)});
  K.travel(CU, I, makeDoc(T.layers.tokens, 'CREDIT ADVICE'), `The custodian tells ${inv} on paper that the bond is credited to its account.`, 2, {count:'docs'});
  K.travel(CSD, D, makeDoc(T.layers.tokens, 'REGISTRY NOTICE'), 'After the next batch, a registry notice goes to the debt office as a document. It carries no payment reference.', 6, {count:'docs'});

  // Reconciliation by hand: a statement file, a spreadsheet, an e-mail exchange, a manual journal
  K.travel(SB, D, makeDoc(T.layers.tokens, 'STATEMENT'), 'The settlement bank’s end-of-day statement reaches the debt office as a file the next morning.', 10, {count:'docs', bend:-40});
  K.check(D, 'Treasury staff load the statement, the payment advice and the registry notice into a spreadsheet and match them by hand.', .5);
  K.badge([[D, 'fail']], 'One line does not match: the value dates differ between the advice and the statement. The line becomes an exception for a person to decide.', .3);
  K.travel(D, SB, makeEnvelope(T.layers.tokens, 1, 'E-MAIL'), 'Staff e-mail the settlement bank’s operations desk with the line and both value dates.', .5, {count:'msgs', bend:40});
  K.travel(SB, D, makeEnvelope(T.layers.tokens, 1, 'E-MAIL'), 'The next day the settlement bank replies by e-mail. Its ledger used the value date it booked that day.', 16, {count:'msgs', bend:-40, burn:false});
  K.check(D, 'The value dates are agreed by e-mail. The entries are then matched by hand against both statements.', .5);
  K.badge([[D, 'ok']], 'The break is cleared. Every line now matches in the spreadsheet. People did the matching, not a system.', .3);
  K.add({dur:1000, sim:.5, cap:`Finance posts the ${to} entry as a manual journal. The controller signs and a printout goes into the audit file; practice varies by country.`, run:p => D.setFlash(.4*Math.sin(Math.PI*p))});
  K.travel(CSD, CU, makeDoc(T.layers.tokens, 'RECON FILE'), 'Next morning the registry and the custodian reconcile their holdings by file, in batch. Neither file contains the payment.', 4, {count:'docs', bend:55});
  K.add({dur:1100, sim:.5, cap:'The bond and the cash are finally matched by hand, days after the payment. Until then no single record showed that both legs were complete.',
    run:p => { D.setBadge(p, 'ok'); D.setFlash(.5*Math.sin(Math.PI*p)); ban.set('MATCHED BY HAND', 1, true); }});

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), ['Messages & documents', String(T.m.msgs + T.m.docs), false], ['Cash before bond', T.m.gap ? 'yes' : '—', T.m.gap]];
  T.extraSummary = () => [['Cash and bond linked', 'no, matched by hand'], ['Fees & FX spread', T.feesText()]];
  T.doneText = 'Done. Cash was booked on day 1 and the bond was credited a day or two later, after a registry queue and a custodian query. The two were matched by hand after that. Two routes, several files and paper advices, and a manual match. Illustrative timings.';
}

function g09Afc(T, K){
  const {org, inv, from, to, fx} = g09Vars(T), usdAmt = T.amountUSD;
  // The process space: two cash-leg anchors and NodeChain inside the frame. AFC is not drawn; the captions name it.
  // Institutions sit outside the frame and reach it only through the API gateway. No holds, no links between institutions.
  // Inside labels carry no second line: the engine's second line would sit on the gateway strip.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, ''],
    ['chain', 'NodeChain', ''],
    ['toAnchor', `Anchor · ${to}`, '']
  ]);
  const I = space.inside;
  const [xB, xC, xR, xD] = planeXs(4);
  const IB  = makeNode(T, {x:xB, y:INST_Y, r:38, label:'Investor’s bank', sub:'Payer', lockAt:[70, -20]});
  const CU  = makeNode(T, {x:xC, y:INST_Y, r:38, label:'Custodian', sub:'Investor account', lockAt:[70, -20]});
  const CSD = makeNode(T, {x:xR, y:INST_Y, r:38, label:'CSD / registry', sub:'Bond title', lockAt:[70, -20]});
  const DO  = makeNode(T, {x:xD, y:INST_Y, r:38, label:g09Short(org, 16), sub:'Issuer · debt office', lockAt:[70, -20]});
  space.connect([IB, CU, CSD, DO]);
  // Gateway points directly above each institution: the only way money or messages leave or enter the frame.
  const gIB  = {x:IB.x, y:SPACE_GW, r:0, presence:1, setPresence(){}};
  const gCSD = {x:CSD.x, y:SPACE_GW, r:0, presence:1, setPresence(){}};
  const funds = makeCoins(T.layers.tokens, from, 4, IB.x, IB.y + 16, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 4, I.chain.x, I.chain.y + 16, 0);
  const spark = space.sig();
  T.m.linked = false;

  // 1 of 5 · each owner checks its own records; the investor's bank sends the confirmed payment and its funds through the gateway
  g09Beat(T, K, `1 of 5 · Request. Each owner checks its own records for ${inv}. The investor’s bank sends the confirmed payment and funds through the gateway. AFC routes them to the ${from} anchor.`, .1, k => {
    k.check([CU, CSD], '', 0, 1800);
    k.badge([[CU, 'ok'], [CSD, 'ok']], '', 0);
    k.check(DO, '', 0, 1800);
    k.badge([[DO, 'ok']], '', 0);
    k.check(IB, '', 0, 1800);
    k.badge([[IB, 'ok']], '', 0);
    k.api(IB, space, '', 0);
    k.coins(funds, IB, gIB, '', 0, {fadeOut:true});
  });

  // 2 of 5 · the cash-leg anchor accepts the funds on its own reserve; the transaction is confirmed
  g09Beat(T, K, `2 of 5 · Accept. The ${from} anchor accepts the funds on its reserve account, held for AFC. AFC checks them against the request, and the ${from} transaction is confirmed.`, .05, k => {
    k.coins(funds, gIB, I.fromAnchor, '', 0, {fadeOut:true});
    k.check(I.fromAnchor, '', 0, 1600);
    k.badge([[I.fromAnchor, 'ok']], '', 0);
  });

  // 3 of 5 · only after acceptance: proof to NodeChain, ArosCoin 1 = 1; the title instruction goes to the registry through the gateway
  g09Beat(T, K, '3 of 5 · Issue. After acceptance, the proof goes to NodeChain and AST issues ArosCoin 1 = 1. AFC routes the title instruction to the registry, in its open window.', .5, k => {
    k.add({dur:1400, start:() => { T.m.pot++; }, run:p => {
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y, (I.fromAnchor.x + I.chain.x)/2, I.fromAnchor.y - 60, I.chain.x, I.chain.y, ease(seg(p, 0, .8)));
      spark.set(x, y, fade(p, .05, .7));
    }});
    k.add({dur:900, run:p => aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)), end:() => { T.m.protoFee = true; }});
    k.travel(gCSD, CSD, makeEnvelope(T.layers.tokens, null, 'INSTRUCTION'), '', 0, {color:C.goldLine});
    k.check(CSD, '', 0, 1800);
    k.api(CSD, space, '', 0);
    k.badge([[CSD, 'ok']], '', 0);
  });

  // 4 of 5 · the output anchor accepts ArosCoin and converts it (or pays it out 1 = 1 when the currency is the same)
  g09Beat(T, K, fx
    ? `4 of 5 · Accept and convert. The ${to} anchor accepts ArosCoin and converts it into ${to} at its own illustrative rate.`
    : `4 of 5 · Accept and pay out. The ${to} anchor accepts ArosCoin 1 = 1. No currency conversion is needed.`, .05, k => {
    k.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true, arrive:() => aro.recur(to)});
    k.check(I.toAnchor, '', 0, 1600);
    k.badge([[I.toAnchor, 'ok']], '', 0);
    k.add({dur:200, start:() => { if (fx) T.addFee(usdAmt == null ? null : usdAmt*FEE.spread); }});
  });

  // 5 of 5 · output on the debt office's own books; NodeChain links the two proofs; notices leave through the gateway
  g09Beat(T, K, `5 of 5 · Output. ${to} is credited to ${org} on its own books. NodeChain links the cash and registry proofs. Notices go out. The process ends.`, .2, k => {
    settleStep(T, k, I.toAnchor, DO, to, to, '', 0, 1200);
    k.badge([[DO, 'ok']], '', 0);
    k.add({dur:1000, run:p => { I.chain.setFlash(.4*Math.sin(Math.PI*p)); I.chain.setBadge(p, 'ok'); }, end:() => { T.m.linked = true; }});
    notify(T, k, space, IB, '', 0);
    notify(T, k, space, CU, '', 0);
    notify(T, k, space, CSD, '', 0);
    notify(T, k, space, DO, '', 0);
  });

  // Five short rows: the fee rows show the illustrative spread and the protocol fee without an amount (its tariff is not set).
  const spread = !fx ? 'none' : usdAmt == null ? '—' : '≈ ' + usd(usdAmt*FEE.spread);
  T.rows = () => [['Holds', 'none on this track', false], ['Proof of transaction', String(T.m.pot), false], ['Money and bond linked', T.m.linked ? 'by evidence' : '—', false], ['FX spread', spread, false], ['Protocol fee', T.m.protoFee ? 'tariff TBD' : '—', false]];
  T.extraSummary = () => [['Cash and bond linked', T.m.linked ? 'yes, by evidence' : 'no'], ['API calls', String(T.m.api)], ['Fees & FX spread', T.feesText()]];
  T.doneText = `Done. Five steps: request, accept, issue, accept and convert, output. ${to} was credited to ${org}. The registry recorded the title on its own register; AFC held no securities and no cash.`;
}

GOV.push({
  key:'gov-bonds', no:'G09', group:'Government',
  name:'Tokenised sovereign bonds', sub:'Two routes by hand vs one AFC process',
  inputs:[{id:'org', label:'Your debt office', type:'text', def:'Debt Management Office'},
          {id:'inv', label:'Foreign investor', type:'text', def:'Investor Ltd'},
          {id:'from', label:'Investor pays in', type:'currency', def:'USD'},
          {id:'to', label:'Bond currency', type:'currency', def:'GEL'},
          {id:'amount', label:'Purchase amount', type:'amount', def:20000000}],
  lede:'A foreign investor buys a tokenised sovereign bond. Today the payment and the registry run as two routes, and the debt office matches them by hand. With AFC one process runs the cash legs and records the proof, while the bond title stays with the registry.',
  note:'Illustrative model. Timings, amounts and FX rates are examples, not quotes or service levels; practice varies by country. The bond title stays with the registry or CSD. AFC holds no securities and no cash; its anchors hold only their own reserves. The With-AFC track has no holds: eligibility, KYC, sanctions and the registry’s record are checks on each institution’s own circle. It does not guarantee delivery-versus-payment. It links the evidence of the cash leg and the registry’s confirmation and claims no atomicity between them. If one leg fails, the banks and the CSD hold or compensate on their own books; nothing is erased. AFC does not decide investor eligibility, KYC or sanctions status and does not refuse or approve investors; a flagged case goes to a person at the institution that holds the data. Settlement-day rules and CSD cut-off times still apply: in this example the registry is inside its window, and otherwise its record waits for the next window. Currency conversion is done by the settlement bank on the Today track and by the output anchor on the With-AFC track, at an illustrative rate. The protocol (PoT) fee has no amount until its tariff is set. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Payment route and registry route', vbH:480, unit:'h', build:g09Today},
  next:{tag:'With AFC', title:'One process, two legs linked by evidence', vbH:420, unit:'h', build:g09Afc}
});
