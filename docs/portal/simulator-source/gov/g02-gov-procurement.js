/* ================= G02 · Government procurement with milestone payments ================= */
function g02Short(v, cur){
  try { return new Intl.NumberFormat('en',{style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); }
  catch { return money(v, cur); }
}
function g02Lock(v, cur){ const f = money(v, cur); return f.length <= 14 ? f : g02Short(v, cur); }
function g02Row(v, cur){ const f = money(v, cur); return f.length <= 12 ? f : g02Short(v, cur); }
function g02Fit(s, k){ return s.length > k ? s.slice(0, k - 1).trimEnd() + '…' : s; }
function g02Hold(T){ return ['Amount on hold now', g02Row(T.holdAmount*T.m.holds, T.cfg.from), T.m.holds > 0]; }
function g02Rest(n){ return n === 1 ? 'The contract is then closed.' : n === 2 ? 'Milestone 2 follows the same route.' : `Milestones 2–${n} follow the same route.`; }
// Contract strip: one segment per milestone, filled as it moves from pending to due to paid.
// The compact form (With AFC) puts the milestone label and its state on one line under the bar.
function g02Strip(T, o){
  const {x, y, w, n, amount, cur, due = C.hold, compact = false} = o, gap = 12, sw = (w - gap*(n - 1))/n, L = T.layers.paths;
  const head = svgEl('text',{x, y:y - (compact ? 10 : 12), 'font-size':11.5, 'letter-spacing':1.4, 'font-weight':600, fill:C.muted}, L);
  head.textContent = `CONTRACT · ${g02Short(amount, cur)} · ${n} MILESTONE${n > 1 ? 'S' : ''}`;
  const COL = {due, paid:C.ok, next:C.rail};
  const segs = [];
  for (let i = 0; i < n; i++) {
    const sx = x + i*(sw + gap);
    svgEl('rect',{x:sx, y, width:sw, height:12, rx:6, fill:'#F1F3F6', stroke:C.rail, 'stroke-width':1}, L);
    const fill = svgEl('rect',{x:sx, y, width:0, height:12, rx:6, fill:C.ok, opacity:0}, L);
    const t = svgEl('text',{x:sx, y:y + (compact ? 30 : 31), 'font-size':13, 'font-weight':600, fill:C.ink}, L); t.textContent = `M${i + 1} · ${g02Short(amount/n, cur)}`;
    const st = compact
      ? svgEl('text',{x:sx + sw, y:y + 30, 'text-anchor':'end', 'font-size':11, 'letter-spacing':1.3, fill:C.muted}, L)
      : svgEl('text',{x:sx, y:y + 48, 'font-size':11, 'letter-spacing':1.3, fill:C.muted}, L);
    st.textContent = 'PENDING';
    segs.push({fill, st});
  }
  return {set(i, state, p = 1, label){
    const s = segs[i]; if (!s) return;
    s.fill.setAttribute('fill', COL[state]); s.fill.setAttribute('opacity', state === 'due' ? .5 : 1);
    s.fill.setAttribute('width', Math.max(0, sw*ease(p)));
    if (p > .4) { s.st.textContent = label; s.st.setAttribute('fill', state === 'paid' ? C.ok : state === 'due' ? due : C.muted); }
  }};
}
/* One With-AFC step is one animation call. Its parts (checks, sparks, coins, notices) run back to
   back inside it, so the viewer's step counter matches the five captions. The parts are built with
   the engine's own step kit on a separate list, then played in order inside the one step. */
function g02Beat(T, K, cap, sim, fill){
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

function g02Today(T, K){
  const v = T.cfg.v, org = v.org || 'State Treasury', sup = v.supplier || 'Supplier';
  const {from, amount} = T.cfg, n = Math.max(1, Math.min(4, Math.round(Number(v.n) || 3))), m = amount/n;
  const amt = money(amount, from), mAmt = money(m, from), Y = 215, r = 54, s = n > 1 ? 's' : '';
  T.holdAmount = m;
  const S = makeNode(T, {x:125, y:Y, r, label:g02Fit(sup, 20), sub:'Supplier'});
  const I = makeNode(T, {x:370, y:Y, r, label:'Site inspector', sub:'Independent', hidden:true});
  const A = makeNode(T, {x:615, y:Y, r, label:'Procuring agency', sub:'Contract owner'});
  const Tr = makeNode(T, {x:860, y:Y, r, label:g02Fit(org, 20), sub:'Budget · payer'});
  const Bk = makeNode(T, {x:660, y:405, r:34, small:true, labelPos:'right', label:'Supplier’s bank', sub:'Commercial bank'});
  const strip = g02Strip(T, {x:60, y:388, w:520, n, amount, cur:from});
  const coins = makeCoins(T.layers.tokens, from, 3, Tr.x, Y + 16, 0);
  const D = label => makeDoc(T.layers.tokens, label);

  // 1 · the contract, the commitment and the start of the clock
  K.pulse(Tr, `The contract is signed on paper: ${sup} builds for the procuring agency, ${amt} in ${n} milestone${s}. ${org} pays.`);
  K.stamp(Tr, ['Commitment registered', 'Budget limit reserved'], `${org} registers the commitment in its budget system and reserves the limit. A book entry: no money has moved.`, 0, 'Treasury · commitment');
  K.travel(A, Tr, D('CONTRACT'), 'The agency sends a paper copy of the signed contract and the milestone schedule to the treasury by internal mail.', 24, {count:'docs'});

  // 2 · milestone 1 is finished; the supplier asks for an acceptance inspection by letter
  K.add({dur:1300, sim:0, cap:`${sup} finishes milestone 1 on site. ${mAmt} is now due under the contract.`, run:p => { S.bump = 1 + .07*Math.sin(p*Math.PI*3)*(1 - p); strip.set(0, 'due', p, 'DUE · RESERVED'); }});
  K.hold(Tr, g02Lock(m, from), `${org} keeps ${mAmt} reserved on its own books. The reservation is real, though the money has not moved.`, 0);
  K.travel(S, A, D('LETTER'), 'The supplier asks the procuring agency, by letter, to commission an acceptance inspection.', 48, {count:'docs', burn:false, bend:-165});
  K.check(A, 'The agency’s registry logs the letter, checks the contract and milestone numbers, and files the request.', 24);

  // 3 · the inspector is commissioned; the request waits in a queue
  K.travel(A, I, D('ORDER'), 'The agency commissions the independent inspector by letter. The request joins the inspector’s queue.', 24, {count:'docs'});
  K.add({dur:2600, sim:120, cap:'The request waits in the inspector’s queue. This is a queue, not a hold. Illustrative: about five days here.', run:p => I.setFlash(.2*Math.sin(Math.PI*p*2))});

  // 4 · the independent inspector measures and writes a paper report
  K.check(I, 'The inspector visits the site and measures the work against the drawings. This physical visit takes the same time in both routes.', 24, 3000);
  K.check(I, 'The inspector checks quantities against the bill of quantities. The inspector measures; the agency decides what is accepted.', 8);
  K.stamp(I, ['Work measured', 'Quantities recorded'], 'The inspector writes a paper measurement report in three copies: one for the agency, one for the supplier, one for the file.', 8, 'Inspector · report');
  K.travel(I, A, D('ACT'), 'The signed paper act goes to the procuring agency by courier. Courier delivery typically takes a day or more.', 24, {count:'docs'});

  // 5 · the agency’s desks read the act; the invoice travels separately, on paper
  K.check(A, 'The agency’s registry logs the act and the courier receipt in a paper register.', 8);
  K.check(A, 'The legal desk checks the act against the contract terms and the milestone schedule. A lawyer reads the file by hand.', 24);
  K.travel(S, A, D('INVOICE'), 'The supplier sends its invoice separately, on paper, by post. Nobody tracks it between the supplier and the agency.', 24, {count:'docs', burn:false, bend:-165});
  K.check(A, 'The finance desk compares the invoice with the act and finds that the quantities do not match. A finance officer decides.', 24);

  // 6 · the invoice goes back for correction; a person decides, nothing is rejected automatically
  K.travel(A, S, D('INVOICE'), 'The finance officer returns the invoice to the supplier by letter. A person decides; nothing is rejected automatically.', 24, {count:'docs', burn:false, bend:165});
  K.pulse(S, 'The supplier phones the agency to ask about the payment. The call is not recorded in any file.', 48);
  K.add({dur:2600, sim:72, cap:'The supplier corrects the invoice and reconciles it with the inspector’s report. Illustrative: about three days, at the supplier’s pace.', run:p => S.setFlash(.2*Math.sin(Math.PI*p*2))});
  K.travel(S, A, D('INVOICE 2'), 'The corrected invoice arrives by post. The review starts again at the first desk, so the act is checked a second time.', 24, {count:'docs', burn:false, bend:-165});

  // 7 · the desks sign off one after another
  K.check(A, 'The legal desk checks the corrected invoice against the act and the contract again. Each desk works from its own paper file.', 24);
  K.check(A, 'The finance desk confirms that the quantities now match the act and the measurement report.', 24);
  K.check(A, 'The budget desk confirms that the budget line still covers this milestone under the commitment.', 24);
  K.stamp(A, ['Act accepted', 'Invoice approved', 'Budget line confirmed'], 'Three desks sign off one after another. The agency head then signs the payment approval.', 24, 'Agency · three desks');

  // 8 · the payment order travels by internal mail; the treasury checks it by hand
  K.travel(A, Tr, D('ORDER'), 'The agency sends a paper payment order to the treasury by internal mail.', 24, {count:'docs'});
  K.check(Tr, 'The treasury checks the order against the commitment, the budget limit and the signatures on file. A clerk compares them by hand.', 24);
  K.check(Tr, 'Dual control: one officer prepares the payment file, a second officer approves it. Both sign on paper before release.', 16);
  K.add({dur:1500, sim:96, cap:'The payment waits for the next treasury payment run, set by the treasury. This is a queue, not a hold. Illustrative: about four days.', run:p => Tr.setFlash(.25*Math.sin(Math.PI*p*2))});
  K.release(Tr, 'The treasury releases milestone 1 for payment. The reservation ends and the payment file goes to the bank.', 2);

  // 9 · the bank settles through its clearing window; the supplier is credited
  K.travel(Tr, Bk, D('PAY FILE'), 'The treasury sends a payment file to its bank. The bank takes it in the next clearing window; a late file waits for the next one.', 4, {count:'docs'});
  K.check(Bk, 'The bank checks the beneficiary account and the file format. Each clearing window has a cut-off time that varies by bank.', 24, 2600);
  K.coins(coins, Tr, Bk, `The payment of ${mAmt} from ${org} settles on the bank’s books. Typically a day or more after the file; varies by country.`, 24);
  K.coins(coins, Bk, S, `The supplier’s bank credits the account of ${sup}. The money reaches the supplier weeks after the work was done.`, 2, {dy:8, end:() => { T.m.paid++; strip.set(0, 'paid', 1, 'PAID'); }});
  K.travel(Tr, S, D('REMITTANCE'), 'The treasury posts a paper remittance advice to the supplier. The supplier matches it to its ledger by hand.', 24, {count:'docs', burn:false, bend:-165});
  K.badge([[S, 'ok']], 'The supplier’s accounts team matches the payment to the invoice by hand and closes the file.', 0);

  // 10 · month end: paper is reconciled by hand, then archived
  K.add({dur:2600, sim:48, cap:'Month end: the agency and the treasury reconcile their paper records by hand. A difference is cleared by memo. Illustrative: about two days.', run:p => { const a = Math.min(seg(p,0,.15), 1 - seg(p,.85,1)); A.setRings(a); Tr.setRings(a); }, end:() => { A.setRings(0); Tr.setRings(0); }});
  K.badge([[Tr, 'ok'], [A, 'ok']], 'The monthly total goes to the state ledger on paper. Both paper files are closed and archived.', 1);
  K.add({dur:2600, sim:0, cap:`${g02Rest(n)} Each later milestone repeats the paper route.`, run:p => { for (let i = 1; i < n; i++) strip.set(i, 'next', seg(p,.2,.8)*.999, 'SAME ROUTE'); }});

  T.rows = () => [R.holds(T), g02Hold(T), R.holdTime(T), R.docs(T), ['Milestones paid', `${T.m.paid} / ${n}`, false]];
  T.extraSummary = () => [['Review rounds for milestone 1', '2 (invoice returned once)']];
  T.doneText = `Paid weeks after the work was done. Paper moved between desks, and the invoice went back once for correction. ${g02Rest(n)}`;
}

function g02Afc(T, K){
  const v = T.cfg.v, org = v.org || 'State Treasury', sup = v.supplier || 'Supplier';
  const {from, amount} = T.cfg, n = Math.max(1, Math.min(4, Math.round(Number(v.n) || 3))), m = amount/n;
  const mAmt = money(m, from), Y = INST_Y, r = 46;
  T.holdAmount = m;
  // The process space: anchors (treasury leg, bank leg) and NodeChain inside the frame. AFC is not drawn;
  // it is named in the captions only. Institutions sit outside and reach the space only through the gateway.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Treasury leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${from}`, 'Bank leg']
  ]);
  const I = space.inside, gate = space.gate;
  const [xS, xIns, xA, xTr, xBk] = planeXs(5);
  const S = makeNode(T, {x:xS, y:Y, r, small:true, label:g02Fit(sup, 18), sub:'Claims milestone', lockAt:[70, -20]});
  const Ins = makeNode(T, {x:xIns, y:Y, r, small:true, label:'Site inspector', sub:'Independent', lockAt:[70, -20]});
  const A = makeNode(T, {x:xA, y:Y, r, small:true, label:'Procuring agency', sub:'Contract owner', lockAt:[70, -20]});
  const Tr = makeNode(T, {x:xTr, y:Y, r, small:true, label:g02Fit(org, 18), sub:'Pays · treasury', lockAt:[70, -20]});
  const Bk = makeNode(T, {x:xBk, y:Y, r, small:true, label:'Supplier’s bank', sub:'Receives payout', lockAt:[70, -20]});
  space.connect([S, Ins, A, Tr, Bk]);
  const strip = g02Strip(T, {x:70, y:434, w:860, n, amount, cur:from, due:C.blue, compact:true});
  const funds = makeCoins(T.layers.tokens, from, 4, Tr.x, Tr.y + 16, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 4, I.chain.x, I.chain.y + 16, 0);
  const spark = space.sig();
  const req = () => makeEnvelope(T.layers.tokens, null, '');

  // 1 of 5 · Request: the institutions do their own work and checks; the confirmed payment reaches AFC
  g02Beat(T, K, '1 of 5 · Request. The site visit, the signed evidence and the own-record checks are done. The confirmed payment reaches AFC through the gateway.', 24, k => {
    k.add({dur:700, sim:0, run:p => strip.set(0, 'due', p, 'DUE')});
    k.api(S, space, '', 0);
    k.check(Ins, '', 0, 2600);
    k.api(Ins, space, '', 0);
    k.check([A, Tr], '', 0, 2600);
    k.badge([[A, 'ok'], [Tr, 'ok']], '', 0);
    k.travel(Tr, gate, req(), '', 0, {burn:false, count:'api'});
    k.coins(funds, Tr, gate, '', 0, {from:[Tr.x, Tr.y + 16], dy:34, fadeOut:true});
  });

  // 2 of 5 · Accept: the treasury anchor accepts the money on its reserve account
  g02Beat(T, K, `2 of 5 · Accept. AFC checks the signature, contract state and policy version. The treasury anchor accepts the funds on its reserve.`, .1, k => {
    k.coins(funds, gate, I.fromAnchor, '', 0, {from:[gate.x, SPACE_GW + 34], fadeOut:true});
    k.badge([[I.fromAnchor, 'ok']], '', 0);
  });

  // 3 of 5 · Issue: after the funds are confirmed, the proof goes to NodeChain and ArosCoin is issued 1 = 1
  g02Beat(T, K, '3 of 5 · Issue. The funds are confirmed. Where the law allows, NodeChain records the proof of transaction, and AST issues ArosCoin 1 = 1.', .1, k => {
    k.add({dur:1500, start:() => { T.m.pot++; }, run:p => {
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y, (I.fromAnchor.x + I.chain.x)/2, 40, I.chain.x, I.chain.y, ease(seg(p, 0, .8)));
      spark.set(x, y, fade(p, .05, .7));
    }});
    k.pulse(I.chain, '', 0);
    k.add({dur:900, run:p => aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5))});
  });

  // 4 of 5 · Accept and convert: the output anchor accepts ArosCoin and converts it 1 = 1
  g02Beat(T, K, `4 of 5 · Accept and convert. The output anchor on the supplier’s bank leg accepts ArosCoin and converts it 1 = 1 into ${from}.`, .05, k => {
    k.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true});
    k.badge([[I.toAnchor, 'ok']], '', 0);
  });

  // 5 of 5 · Output: the payout settles on the bank’s own books; notices leave through the gateway
  g02Beat(T, K, `5 of 5 · Output. The supplier’s bank credits ${mAmt} on its own books. Notices and a reconciliation record leave through the gateway. The process ends.`, 2, k => {
    settleStep(T, k, I.toAnchor, Bk, from, from, '', 0, 1200);
    k.badge([[Bk, 'ok']], '', 0);
    k.add({dur:600, run:p => strip.set(0, 'paid', p, 'PAID'), end:() => { T.m.paid++; }});
    notify(T, k, space, S, '', 0);
    notify(T, k, space, A, '', 0);
    notify(T, k, space, Tr, '', 0);
    k.add({dur:900, run:p => { for (let i = 1; i < n; i++) strip.set(i, 'next', seg(p, .1, .7)*.999, 'SAME ROUTE'); }});
  });

  T.rows = () => [['Holds', 'none on this track', false], ['Proof of transaction', String(T.m.pot), false], ['API calls', String(T.m.api), false], ['Paper documents', String(T.m.docs), false], ['Milestones paid', `${T.m.paid} / ${n}`, false]];
  T.extraSummary = () => [['Review rounds for milestone 1', '1 (one pass)']];
  T.doneText = `Paid about a day after the work was done, mostly the site visit (illustrative). ${g02Rest(n)}`;
}

GOV.push({
  key:'gov-procurement', no:'G02', group:'Government',
  name:'Procurement milestones', sub:'Paper acceptance vs signed evidence',
  inputs:[ {id:'org', label:'Your treasury', type:'text', def:'State Treasury'},
           {id:'supplier', label:'Supplier', type:'text', def:'Northline Builders'},
           {id:'from', label:'Currency', type:'currency', def:'USD'},
           {id:'amount', label:'Contract value', type:'amount', def:12000000, max:100000000000},
           {id:'n', label:'Milestones', type:'number', def:3, min:1, max:4} ],
  lede:'A government contract is paid in milestones. Today each milestone waits for paper acts, desk approvals and a payment run. With AFC, the signed evidence is checked once and the treasury pays on its own books.',
  note:'Illustrative model. Timings are examples, not service levels, and the site visit takes the same time in both routes. AFC is a logical process layer: it holds no funds, does not accept the work, does not decide that a milestone is complete and never denies a payment automatically. The independent inspector signs the evidence; the procuring agency and the treasury confirm on their own records and pay on their own books. The With-AFC track does not wait for a payment run: it assumes the treasury sends payment once the evidence is linked. Payment-run cadence stays the treasury’s own. A mismatch or a dispute puts the milestone on hold for a person to review. After a payment is final, an error is corrected by a compensating entry, not by erasing records. Proof of Transaction is recorded only where the law allows. ArosCoin is issued 1 = 1 only after the funds are accepted and never moves between institutions. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Paper acts, desks and a payment run', vbH:460, unit:'h', build:g02Today},
  next:{tag:'With AFC', title:'Signed evidence, one AFC request', vbH:470, unit:'h', build:g02Afc}
});
