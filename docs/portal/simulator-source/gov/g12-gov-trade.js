/* ================= G12 · Cross-border trade corridor ================= */
// Goods cross the border one way and the payment travels back. Today the institutions talk to each other, as they do now:
// every bank, central bank and customs office applies its own cut-off, fee, finality rule and manual check, one after another.
// With AFC: one process space. Each institution checks its own side on its own circle and reaches the process only through
// the API gateway. AFC is not drawn; the captions name it as the component that routes the request. Waiting times are illustrative.
function g12Fit(s, k){ return s.length > k ? s.slice(0, k - 1).trimEnd() + '…' : s; }
function g12Lock(v, cur, max = 12){ const f = money(v, cur); if (f.length <= max) return f; try { return new Intl.NumberFormat('en',{style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); } catch { return f; } }
function g12Vars(T){
  const v = T.cfg.v, {from, to, amount} = T.cfg;
  const parts = String(v.corridor || 'Georgia — Kazakhstan').split(/\s+[-–—]\s+|\s*[–—]\s*/).map(x => x.trim()).filter(Boolean);
  const a = g12Fit(parts[0] || 'Country A', 14), b = g12Fit(parts[1] || 'Country B', 14);
  const r1 = RATES[from], r2 = RATES[to], toAmt = (r1 && r2) ? amount*r2/r1 : null;
  return {org:v.org || 'Caucasus Trade Bank', a, b, from, to, amount, fx:from !== to, amt:g12Lock(amount, from, 14), lockT:g12Lock(amount, from), toT:from === to ? g12Lock(amount, from, 14) : toAmt == null ? `the converted amount in ${to}` : g12Lock(toAmt, to, 14)};
}
function g12After(T, fn){ const st = T.steps[T.steps.length - 1], r0 = st.run; st.run = p => { r0 && r0(p); fn(p); }; }
// Name and role above a customs node (the standard label below would collide with the connectors).
function g12Tag(T, n, l1, l2){
  const t1 = svgEl('text',{x:n.x, y:n.y - n.r - 14, 'text-anchor':'middle', 'font-size':16.5, 'font-weight':600, fill:C.ink}, T.layers.nodes); t1.textContent = l1;
  const t2 = svgEl('text',{x:n.x, y:n.y - n.r - 32, 'text-anchor':'middle', 'font-size':12, 'letter-spacing':1.2, fill:C.muted}, T.layers.nodes); t2.textContent = l2.toUpperCase();
}
// The border between the two sides, with a name for each side.
function g12Border(T, x, y1, y2, yl, a, b){
  const L = T.layers.paths;
  svgEl('line',{x1:x, y1, x2:x, y2, stroke:C.muted, 'stroke-width':1.2, 'stroke-dasharray':'3 6', opacity:.85}, L);
  const t = svgEl('text',{x, y:y1 - 8, 'text-anchor':'middle', 'font-size':11, 'letter-spacing':1.8, 'font-weight':600, fill:C.muted}, L); t.textContent = 'BORDER';
  const l = svgEl('text',{x:x - 14, y:yl, 'text-anchor':'end', 'font-size':12, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, L); l.textContent = `${a.toUpperCase()} SIDE`;
  const r = svgEl('text',{x:x + 14, y:yl, 'text-anchor':'start', 'font-size':12, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, L); r.textContent = `${b.toUpperCase()} SIDE`;
}
// One With-AFC step is one animation call. Its parts run back to back inside it, so the viewer's counter matches "n of 5".
function g12Beat(T, K, cap, sim, fill){
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
// Notices leave the process space through the gateway strip, one envelope per institution, all at once.
function g12Notices(T, S, space, nodes, dur = 1700){
  const items = nodes.map(n => ({n, env:makeEnvelope(T.layers.tokens, null, 'NOTICE')}));
  S.add({dur, run:p => items.forEach(({n, env}) => env.set(n.x, lerp(space.busY + 8, n.y - n.r - 12, ease(seg(p, 0, .8))), fade(p, .08, .9)))});
}

function g12Today(T, K){
  const {org, a, b, from, to, fx, amt, lockT, toT} = g12Vars(T), Y = 300;
  const D = (l, sealed) => makeDoc(T.layers.tokens, l, sealed), E = n => makeEnvelope(T.layers.tokens, n, 'PAYMENT');
  const Q = (node, cap, sim) => K.add({dur:1500, sim, cap, run:p => node.setFlash(.25*Math.sin(Math.PI*p*2))});
  g12Border(T, 500, 64, 436, 452, a, b);
  const EB = makeNode(T, {x:110, y:Y, r:46, label:org, sub:'Exporter’s bank'});
  const RA = makeNode(T, {x:370, y:Y, r:46, label:`RTGS · ${a}`, sub:'Central bank'});
  const RB = makeNode(T, {x:630, y:Y, r:46, label:`RTGS · ${b}`, sub:'Central bank'});
  const IB = makeNode(T, {x:890, y:Y, r:46, label:'Importer’s bank', sub:'Payer'});
  const CuA = makeNode(T, {x:150, y:92, r:34, small:true, label:'', sub:''});
  const CuB = makeNode(T, {x:850, y:92, r:34, small:true, label:'', sub:''});
  g12Tag(T, CuA, 'Export customs', a); g12Tag(T, CuB, 'Import customs', b);
  rail(T, EB, RA); rail(T, RA, RB, .3, true); rail(T, RB, IB);
  const box = makeBox(T.layers.tokens), coins = makeCoins(T.layers.tokens, from, 4, IB.x, Y + 16, 0);
  const wait = edge(CuA, CuB, 40);

  // Export side: outside the payment clock.
  K.pulse(EB, `An exporter in ${a} banks with ${org}. The goods have shipped to a buyer in ${b}. The exporter is owed ${toT}, paid in ${to}.`, 0);
  K.check(CuA, `Export customs in ${a} checks the export declaration against the goods. Illustrative: a day or two, outside both clocks.`, 0, 2600);
  K.travel(CuA, CuB, box, 'The goods cross the border one way. The voyage itself is excluded from both clocks.', 0, {lineOpacity:.3});
  g12After(T, p => { const [x, y] = quad(...wait, ease(p)); box.set(x, y, seg(p, 0, .1)); });
  K.check(CuB, `Import customs in ${b} examines the declaration. It will not release the goods until it sees paper proof of payment.`, 0, 2600);

  // Importer’s bank: the payment clock starts here.
  K.pulse(IB, `The buyer asks its bank in ${b} to pay ${amt} against the invoice and the shipping papers. The payment clock starts here.`, 0);
  K.check(IB, 'The importer’s bank screens the buyer and the payment: sanctions, AML and PEP lists. Alerts wait in a manual queue, typically hours.', .5, 2800);
  K.check(IB, 'A clerk checks the invoice and the bill of lading by hand against the payment order. A mismatch stops the order for a documentary review.', 1.5, 2600);
  K.check(IB, 'The importer’s bank files its screening record for its own regulator. The exporter’s bank never sees this record.', 0, 2000);
  Q(IB, 'The payment reference omits the invoice number. The bank asks the buyer to resend the order, and the buyer answers by phone. Illustrative: about a day.', 20);
  K.hold(IB, lockT, `The importer’s bank blocks ${amt} on the buyer’s account. This hold is real: the buyer cannot use the money until the payment completes or fails.`, 1);

  // Central bank of the importer’s side: its own cut-off, rulebook and window.
  K.travel(IB, RB, E(1), `The payment message goes to the central bank in ${b}. It accepts messages only before its daily cut-off.`, 1, {count:'msgs'});
  Q(RB, 'The message arrives after the cut-off. It waits for the next morning window. Illustrative: about ten hours. This is a queue, not a hold on funds.', 10);
  K.check(RB, `The central bank in ${b} applies its own rulebook: liquidity, limits, sanctions screening and its own finality rule.`, .5, 2600);
  K.stamp(RB, ['Window open', 'Fee applied'], `The central bank in ${b} accepts the payment under its own rules.`, .5, `RTGS · ${b}`);
  K.add({dur:1700, sim:1, cap:`Settlement starts: the importer’s bank pays the central bank in ${b} on its own books. The buyer’s block ends.`, run:p => {
    IB.releaseLock(seg(p, 0, .3));
    const [x, y] = quad(IB.x, Y + 16, 760, Y - 12, RB.x, Y + 16, ease(seg(p, .25, .95))); coins.set(x, y, 1);
  }, end:() => { T.holdOff(); T.addFee(FEE.corr); }});

  // Cross-border link: a different clock, a repair by hand, then the other central bank.
  K.travel(RB, RA, E(2), `The cross-border link passes the message to ${a}. That system opens on its own clock, so the message waits for its next window.`, 14, {count:'msgs'});
  Q(RA, 'A field fails the format check on the link. An operator at the central bank repairs it by hand and resubmits. Illustrative: about six hours.', 6);
  K.check(RA, `The central bank in ${a} runs its own checks: cut-off, limits, fee and finality rule. Its own rules apply, not those of ${b}.`, 3, 2600);
  K.stamp(RA, ['Window open', 'Credit prepared'], `The central bank in ${a} accepts the payment and prepares the credit to ${org}.`, 1, `RTGS · ${a}`);
  K.coins(coins, RB, RA, fx ? `The cross-border leg settles on ${a}’s books. The conversion ${from} to ${to} takes its own fee and spread.` : `The cross-border leg settles on ${a}’s books and takes its own fee.`, 1,
    {fee:`−${usd(FEE.corr)}`, arrive:() => { if (fx) { coins.recur(to); RA.setFlash(.6); setTimeout(() => RA.setFlash(0), 260); } },
     end:() => { T.addFee(FEE.corr); if (fx) T.addFee(T.amountUSD == null ? null : T.amountUSD*FEE.spread); }});

  // Exporter’s bank: a batch advice, a manual match and a suspense queue (not a hold).
  K.travel(RA, EB, E(3), `The central bank in ${a} sends the credit advice to ${org} in its own batch file. The file goes out when the batch closes.`, 4, {count:'msgs'});
  K.check(EB, `${org} screens the sender and the payment, then matches the credit to the invoice by hand. A mismatch stops the credit for review.`, 8, 2600);
  Q(EB, 'The credit sits in a suspense account until a clerk matches it. This is a queue, not a hold on the buyer’s funds. Illustrative: one to two days.', 24);
  K.coins(coins, RA, EB, `${org} credits the exporter ${toT}, less its lifting fee. Each leg settled on its own books, one after another.`, 2,
    {fee:`−${usd(FEE.lifting)}`, arrive:() => { EB.setBadge(1, 'ok'); }, end:() => T.addFee(FEE.lifting)});

  // Paper route to import customs: a payment confirmation on paper, a queue, a manual match and the release.
  K.travel(IB, CuB, D('PAYMENT PROOF', true), 'The importer’s bank issues a paper payment confirmation. The buyer collects it and takes it to import customs.', 12, {count:'docs', burn:false});
  Q(CuB, 'The buyer waits with the paper in the customs queue. Illustrative: a day or more, depending on the office.', 24);
  K.check(CuB, 'Import customs matches the proof to the declaration. Clearance is its own decision. A physical inspection, if picked, adds days.', 4, 3000);
  K.add({dur:1700, sim:4, cap:'Import customs releases the goods. They waited for the whole payment route, and each stage kept its own rules.', run:p => {
    CuB.setBadge(seg(p, 0, .4), 'ok'); CuB.setFlash(.5*Math.sin(Math.PI*seg(p, 0, .5)));
    box.set(lerp(wait[4], 975, ease(seg(p, .2, 1))), 92, 1 - seg(p, .75, 1));
  }});

  // Close-out: paper copies, end-of-day matches and separate records. None of this links the institutions.
  Q(EB, 'A paper copy of the customs release goes to the exporter by post. The exporter passes it to its bank. Illustrative: several days.', 48);
  K.check(EB, 'The exporter’s bank closes its file: the credit, the invoice and the release are matched by hand. Typically a day or more.', 0, 2600);
  K.check(RB, `End of day: the central bank in ${b} matches its settlement report to the link file. A mismatch is fixed by hand the next day.`, 2, 2400);
  K.check(RA, `The central bank in ${a} runs the same end-of-day match on its side. Each bank keeps its own records of the payment.`, 0, 2400);
  K.badge([[IB, 'ok'], [EB, 'ok']], `${org} and the importer’s bank each keep their own paper and electronic records. Nothing links the two records automatically.`, 0);

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), ['Messages & paper documents', String(T.m.msgs + T.m.docs), false], R.fees(T)];
  T.extraSummary = () => [['Rule sets applied', '6, one after another'], ['Fees & FX spread', T.feesText()]];
  T.doneText = `Done. ${org} was credited ${toT} after three payment legs, two customs steps and a manual match. Each stage had its own cut-off, fee and check.`;
}

function g12Afc(T, K){
  const {org, a, b, from, to, fx, toT} = g12Vars(T), r = 34, Y = INST_Y;
  // The process space: anchors (one per fiat leg) and NodeChain inside the frame. AFC is not drawn.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['toAnchor', `Anchor · ${to}`, 'Exporter leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['fromAnchor', `Anchor · ${from}`, 'Importer leg']
  ]);
  const I = space.inside;
  // Institutions sit outside, in one row, each reaching the process only through the gateway.
  const xs = [88, 256, 424, 576, 744, 912];
  const mk = (x, label, sb) => makeNode(T, {x, y:Y, r, small:true, label, sub:sb, lockAt:[70, -20]});
  const EB = mk(xs[0], g12Fit(org, 20), 'Exporter’s bank');
  const CuA = mk(xs[1], 'Export customs', a);
  const RA = mk(xs[2], 'Central bank', a);
  const RB = mk(xs[3], 'Central bank', b);
  const CuB = mk(xs[4], 'Import customs', b);
  const IB = mk(xs[5], 'Importer’s bank', 'Payer');
  const row = [EB, CuA, RA, RB, CuB, IB];
  space.connect(row);
  const funds = makeCoins(T.layers.tokens, from, 4, IB.x, IB.y, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 4, I.chain.x, I.chain.y + 16, 0);
  const pot = space.sig(), ft = floatText(T.layers.fx, I.chain.x, I.chain.y - 40, '1 = 1', C.afc);
  const feeAt = (n, text) => floatText(T.layers.fx, n.x, n.y - n.r - 10, text, C.hold);
  const feeImporter = feeAt(I.fromAnchor, `−${usd(FEE.corr)}`), feePayout = feeAt(I.toAnchor, `−${usd(FEE.corr)}`), feeCredit = feeAt(EB, `−${usd(FEE.lifting)}`);
  // Funds leave the importer’s bank, go up through the gateway and land on the anchor’s reserve. Nothing rests on the process.
  const fundsAt = p => p < .45
    ? [IB.x, lerp(IB.y - 30, space.busY, ease(seg(p, 0, .45)))]
    : [lerp(IB.x, I.fromAnchor.x, ease(seg(p, .45, 1))), lerp(space.busY, I.fromAnchor.y + 16, ease(seg(p, .45, 1)))];

  // 1 of 5 · request: each institution checks its own side; the confirmed payment comes through the gateway and AFC routes it
  g12Beat(T, K, `1 of 5 · Request. Each institution checks its own side first. The confirmed payment reaches AFC through the gateway, which routes it to the ${from} anchor.`, 2, S => {
    S.onePass(row, space, '', 0);
    S.api(IB, space, '', 0);
    S.badge(row.map(n => [n, 'ok']), '', 0);
  });

  // 2 of 5 · accept: the funds land on the importer-leg anchor’s reserve; the anchor confirms the credit
  g12Beat(T, K, `2 of 5 · Accept. The ${from} anchor accepts the funds on its own reserve account. AFC checks the arrived funds against the request.`, .2, S => {
    S.add({dur:1300, run:p => { const [x, y] = fundsAt(p); funds.set(x, y, fade(p, .05, .85)); }});
    S.check(I.fromAnchor, '', 0, 900);
    S.badge([[I.fromAnchor, 'ok']], '', 0);
    S.add({dur:900, start:() => T.addFee(FEE.corr), run:p => feeImporter.set(seg(p, .2, 1))});
  });

  // 3 of 5 · issue: only after acceptance the proof of transaction goes to NodeChain; AST issues ArosCoin 1 = 1
  g12Beat(T, K, `3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1 against the confirmed ${from}.`, .1, S => {
    S.add({dur:1100, start:() => { T.m.pot++; T.m.protoFee = true; }, run:p => {
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y, 670, 40, I.chain.x, I.chain.y, ease(p));
      pot.set(x, y, fade(p, .05, .9));
    }});
    S.badge([[I.chain, 'ok']], '', 0);
    S.add({dur:900, run:p => { aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)); ft.set(p); }});
  });

  // 4 of 5 · accept and convert: the payout-leg anchor takes ArosCoin and converts it at its own quote
  g12Beat(T, K, fx
    ? `4 of 5 · Accept and convert. The ${to} anchor accepts ArosCoin and converts it at its own quote. AFC checks its reserve. The ${to} window still applies.`
    : `4 of 5 · Accept and pay out. The ${to} anchor accepts ArosCoin, 1 = 1. AFC checks its reserve. The ${to} window still applies.`, 6, S => {
    S.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true, dur:1200, arrive:() => { if (fx) aro.recur(to); },
      end:() => { T.addFee(FEE.corr); if (fx) T.addFee(T.amountUSD == null ? null : T.amountUSD*FEE.spread); }});
    S.check(I.toAnchor, '', 0, 900);
    S.badge([[I.toAnchor, 'ok']], '', 0);
    S.add({dur:900, run:p => feePayout.set(seg(p, .2, 1))});
  });

  // 5 of 5 · output: the exporter’s bank is credited on its own books; notices go out through the gateway; customs reads the evidence
  g12Beat(T, K, `5 of 5 · Output. The exporter’s bank is credited ${to} on its own books. Import customs reads the evidence through the gateway and releases the goods.`, .5, S => {
    settleStep(T, S, I.toAnchor, EB, to, to, '', 0, 1000);
    S.add({dur:900, start:() => T.addFee(FEE.lifting), run:p => feeCredit.set(seg(p, .2, 1))});
    g12Notices(T, S, space, [EB, IB, RA, RB], 1500);
    S.api(CuB, space, '', 0);
    S.check(CuB, '', 0, 900);
    S.badge([[EB, 'ok'], [CuB, 'ok'], [IB, 'ok']], '', 0);
  });

  T.rows = () => [['Holds on this track', String(T.m.holds), false], R.api(T), R.docs(T), ['Token before acceptance', '0', false], ['Fees & FX spread', T.feesText(), false]];
  T.extraSummary = () => [['Rule sets applied', '6, each on its own circle'], ['Fees & FX spread', T.feesText()]];
  T.doneText = `Done. The exporter’s bank was credited ${toT} in five AFC steps. Each institution still applied its own rules, cut-offs and checks, once, on its own circle. Physical inspection still takes its time.`;
}

GOV.push({
  key:'gov-trade', no:'G12', group:'Government',
  name:'Cross-border trade corridor', sub:'Separate rulebooks vs one AFC process',
  inputs:[ {id:'corridor', label:'Corridor (exporter — importer)', type:'text', def:'Georgia — Kazakhstan'},
           {id:'org', label:'Your bank (exporter’s)', type:'text', def:'Caucasus Trade Bank'},
           {id:'from', label:'Importer pays in', type:'currency', def:'KZT'},
           {id:'to', label:'Exporter paid in', type:'currency', def:'GEL'},
           {id:'amount', label:'Trade amount', type:'amount', def:60000000} ],
  lede:'Goods cross a border one way and the payment travels back, through several rulebooks, cut-offs and manual matches in turn. With AFC, each institution checks its own side once, and one process carries the payment.',
  note:'Illustrative model. Corridor names, currencies, rates, cut-off windows and waiting times are examples; no real corridor performance is implied. Each leg still settles on its own institution’s books under its own cut-off times, so AFC does not make the legs one atomic transaction; they are linked by evidence. Sanctions and AML screening stay with each bank and each customs authority: AFC never routes around a screening, and a hit stops the payment for that institution’s own review. Customs clearance and any physical inspection stay with customs. AFC holds no funds; the anchors hold their own reserve accounts. AFC does not replace central banks, RTGS systems, correspondents or customs, and it does not remove cut-off windows or time zones. The With-AFC track does not remove any institution’s own fee, cut-off or check. Its fees are the Today corridor fees plus an unpriced PoT fee, so no fee saving is claimed. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Separate rulebooks and manual matches', vbH:466, unit:'h', build:g12Today},
  next:{tag:'With AFC', title:'One process, five steps', vbH:460, unit:'h', build:g12Afc}
});
