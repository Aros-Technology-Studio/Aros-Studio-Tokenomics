/* ================= G10 · Carbon / energy subsidy ================= */
// Today: a paper claim through a registry and a desk queue, a budget commitment on paper, a site check by an accredited
// verifier, a re-keying of the verified figure, a committee, a paper payment order and a payment run. The institutions
// talk to each other, as they do now. Waiting times are illustrative.
// With AFC: one payout in five steps inside one process space. The verifier signs the measured result on its own circle,
// the ministry approves on its own circle and the treasury checks its own budget line. Institutions reach the process only
// through the API gateway. There are no holds: every condition is a check on the responsible institution's own circle.
function g10Short(v, cur){
  try { return new Intl.NumberFormat('en',{style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); }
  catch { return money(v, cur); }
}
function g10Lock(v, cur){ const f = money(v, cur); return f.length <= 12 ? f : g10Short(v, cur); }
function g10Fit(s, k){ return s.length > k ? s.slice(0, k - 1).trimEnd() + '…' : s; }
function g10Cfg(T){
  const v = T.cfg.v, mwh = /MWh/.test(v.basis || '');
  const rate = Math.max(1, Number(v.rate) || 40), qty = Math.max(1, Math.round(Number(v.qty) || 25000)), claimed = Math.max(qty + 1, Math.round(qty*1.2));
  const n = x => x >= 1e7 ? new Intl.NumberFormat('en',{notation:'compact', maximumFractionDigits:1}).format(x) : x.toLocaleString('en');
  return {org:v.org || 'Ministry of Energy', co:v.company || 'Company', cur:T.cfg.from, mwh, rate, qty, claimed, n,
    u:mwh ? 'MWh' : 't CO2e', what:mwh ? 'MWh saved' : 't CO2e avoided', per:mwh ? 'MWh' : 'tonne',
    rateT:money(rate, T.cfg.from), sub:qty*rate, claimSub:claimed*rate};
}
// Twelve monthly bars of meter data: dashed = raw readings, filled = verified share, red band = the gap between them.
function g10Panel(T, o){
  const L = T.layers.paths, n = 12, gap = 8, bw = (o.w - gap*(n - 1))/n;
  const shape = [.74,.8,.86,.94,1.02,1.08,1,.95,1.04,1.12,1.05,.98], max = 1.12, ratio = o.ratio;
  const head = svgEl('text',{x:o.x, y:o.y - o.h - 14, 'font-size':11.5, 'letter-spacing':1.4, 'font-weight':600, fill:C.muted}, L); head.textContent = o.title;
  svgEl('line',{x1:o.x - 4, y1:o.y + .5, x2:o.x + o.w + 4, y2:o.y + .5, stroke:C.rail, 'stroke-width':1}, L);
  const bars = shape.map((s, i) => {
    const x = o.x + i*(bw + gap), h = o.h*s/max;
    const raw = svgEl('rect',{x, y:o.y, width:bw, height:0, rx:2, fill:'#EEF1F5', stroke:'#9AA1AC', 'stroke-width':1, 'stroke-dasharray':'3 3'}, L);
    const ver = svgEl('rect',{x, y:o.y, width:bw, height:0, rx:2, fill:o.color, opacity:.9}, L);
    const gp = svgEl('rect',{x, y:o.y - h, width:bw, height:h*(1 - ratio), rx:2, fill:C.hold, opacity:0}, L);
    const m = svgEl('text',{x:x + bw/2, y:o.y + 14, 'text-anchor':'middle', 'font-size':10, fill:C.muted}, L); m.textContent = 'JFMAMJJASOND'[i];
    return {raw, ver, gp, h};
  });
  return {
    grow(p){ bars.forEach((b, i) => { const q = ease(seg(p, i/24, i/24 + .5)); b.raw.setAttribute('y', o.y - b.h*q); b.raw.setAttribute('height', b.h*q); }); },
    verify(p, showGap){ bars.forEach((b, i) => { const q = ease(seg(p, i/30, i/30 + .6)), vh = b.h*ratio*q; b.ver.setAttribute('y', o.y - vh); b.ver.setAttribute('height', vh); if (showGap) b.gp.setAttribute('opacity', .38*seg(p,.6,1)); }); }
  };
}
// Two-figure readout next to the panel (claimed vs verified).
function g10Readout(T, x, y, l1, l2){
  const L = T.layers.paths, mk = (yy, size, w, fill, txt) => { const t = svgEl('text',{x, y:yy, 'font-size':size, 'font-weight':w, 'letter-spacing':size < 12 ? 1.3 : 0, fill}, L); t.textContent = txt; return t; };
  mk(y, 11, 500, C.muted, l1); const a = mk(y + 21, 16, 600, C.ink, '—');
  mk(y + 46, 11, 500, C.muted, l2); const b = mk(y + 67, 16, 600, C.ink, '—');
  return {a(txt, col){ a.textContent = txt; a.setAttribute('fill', col || C.ink); }, b(txt, col){ b.textContent = txt; b.setAttribute('fill', col || C.ink); }};
}
// One With-AFC step is one animation call. Its parts (checks, sparks, coins, notices) run back to back inside it,
// so the viewer's step counter matches the captions "n of 5".
function g10Beat(T, K, cap, sim, fill){
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

/* ---------- Today: the real path, institution by institution ----------
   Layout: company’s bank and company on the top row, ministry in the middle, treasury on the top right,
   verifier lower right. Every hand-off is a message, a paper file, a queue, a batch or a manual step. */
function g10Today(T, K){
  const g = g10Cfg(T), {org, co, cur, u} = g, Y = 200, r = 54;
  const qtyT = `${g.n(g.qty)} ${u}`, clT = `${g.n(g.claimed)} ${u}`, sub = money(g.sub, cur), claimSub = money(g.claimSub, cur), gap = g.n(g.claimed - g.qty);
  T.holdAmount = g.claimSub;
  const Bk = makeNode(T, {x:120, y:Y, r:40, label:'Company’s bank', sub:'Commercial bank'});
  const Co = makeNode(T, {x:330, y:Y, r, label:g10Fit(co, 20), sub:'Applicant'});
  const Mi = makeNode(T, {x:560, y:Y, r, label:g10Fit(org, 22), sub:'Scheme owner'});
  const Tr = makeNode(T, {x:790, y:Y, r, label:'Treasury', sub:'Payer'});
  const Vr = makeNode(T, {x:790, y:390, r:40, labelPos:'right', label:'Verifier', sub:'Accredited', hidden:true, stampAt:[-200, 0]});
  const panel = g10Panel(T, {x:60, y:440, w:240, h:50, ratio:g.qty/g.claimed, color:C.blue, title:'METER DATA · 12 MONTHS'});
  const ro = g10Readout(T, 330, 376, 'CLAIMED', 'VERIFIED');
  const coins = makeCoins(T.layers.tokens, cur, 3, Tr.x, Tr.y + 16, 0);
  const D = label => makeDoc(T.layers.tokens, label);

  // 1–6 · the company’s claim and the paper application
  K.add({dur:1900, sim:0, cap:`${co} finishes an efficiency project under the ${org} scheme. Its own meters show ${clT} avoided. The figure is the company’s own, not yet checked.`, run:p => {
    Co.bump = 1 + .07*Math.sin(p*Math.PI*3)*(1 - p); panel.grow(p); if (p > .6) ro.a(clT);
  }});
  K.add({dur:1500, sim:240, cap:`${co} compiles the paper pack: claim spreadsheet, twelve months of meter logs, calibration certificates and invoices. Illustrative: about ten days.`, run:p => Co.setFlash(.2*Math.sin(Math.PI*p*2))});
  K.travel(Co, Mi, D('APPLICATION'), `${co} posts the paper application to the ministry registry: ${clT} at ${g.rateT} per ${g.per}, ${claimSub} in total.`, 24, {count:'docs', bend:-60});
  K.stamp(Mi, ['Receipt stamped', 'File number opened'], 'The registry logs the application, stamps the receipt date and opens a file. The file waits in the registry queue.', 48, 'Registry');
  K.travel(Mi, Co, D('QUERY'), 'The registry finds the calibration certificates missing. A letter asks for them, and the file stops until they arrive.', 48, {count:'docs', burn:false, bend:-60});
  K.travel(Co, Mi, D('CERTIFICATE'), 'The company posts the certificates and the missing meter logs by mail. Illustrative: about a week. The file goes back into the queue.', 168, {count:'docs', burn:false, bend:-60});

  // 7–11 · the desk queue, the desk check and the budget request
  K.add({dur:1500, sim:336, cap:'The file waits in the desk queue. Illustrative: several weeks, depending on the caseload.', run:p => Mi.setFlash(.25*Math.sin(Math.PI*p*2))});
  K.check(Mi, 'A desk officer checks the forms, the spreadsheet arithmetic and the eligible period. Meters cannot be checked from a desk.', 8, 2600);
  K.check(Mi, 'The officer searches the ministry’s own grants register for other public money on the same project. The search is manual.', 4, 2000);
  K.travel(Mi, Tr, D('BUDGET'), 'The ministry asks the treasury to commit the claimed amount to the scheme budget. The request is a paper form with the file number.', 24, {count:'docs', burn:false, bend:0});
  K.check(Tr, 'The treasury’s budget office checks that the scheme line has room for the claimed amount. Typically a day or two.', 24, 2600);

  // 12–13 · the budget commitment (a real hold on budget, not on cash) and its confirmation
  K.hold(Tr, g10Lock(g.claimSub, cur), `The treasury enters a budget commitment for ${claimSub}. No cash moves; the amount is unavailable for other claims.`, 2);
  K.travel(Tr, Mi, D('CONFIRM'), 'The treasury confirms the commitment to the ministry by letter. It stays in place until the payment is made or cancelled.', 24, {count:'docs', burn:false, bend:60});

  // 14–21 · the verifier: order, visit date, site check, draft, comment period, final report
  K.travel(Mi, Vr, D('ORDER'), 'The ministry orders an on-site check by an accredited verifier: a paper order with the claim and the meter list.', 48, {count:'docs', bend:-40});
  K.add({dur:1500, sim:240, start:() => { T.m.msgs++; }, cap:'The verifier fixes the visit date with the plant by phone, with the ministry in copy. Illustrative: about ten days.', run:p => Vr.setFlash(.25*Math.sin(Math.PI*p*2))});
  K.check(Vr, 'On site, the verifier checks calibration certificates against the physical meters, reads the logs and samples readings. Typically two to three days.', 72, 3000);
  K.stamp(Vr, ['Meters checked', 'Readings sampled'], `The verifier confirms ${qtyT}, below the ${clT} claimed. It counts only readings it can match to valid calibration.`, 8, 'Verifier');
  K.travel(Vr, Mi, D('DRAFT'), 'The verifier sends its draft findings to the ministry on paper, with the calibration annexes.', 24, {count:'docs', burn:false, bend:-40});
  K.travel(Mi, Co, D('FINDINGS'), 'The ministry forwards the draft findings to the company on paper. The company has a set period to comment.', 24, {count:'docs', burn:false, bend:-60});
  K.travel(Co, Mi, D('ACCEPTS'), 'The company accepts the verified figure in writing. A dispute would stop the file for a second check; this route does not show one.', 168, {count:'docs', burn:false, bend:-60});
  K.travel(Vr, Mi, D('REPORT'), 'The verifier’s final report goes to the ministry on paper, with signed annexes and site photographs.', 24, {count:'docs', burn:false, bend:-40});

  // 22–24 · manual re-keying: the gap is found weeks after filing
  K.add({dur:1900, sim:24, cap:'The ministry re-keys the verified figure by hand into its own spreadsheet. Nothing is linked to the company’s data.', run:p => {
    Mi.setRings(Math.min(seg(p,0,.15), 1 - seg(p,.85,1))); panel.verify(p, true); if (p > .5) ro.b(qtyT, C.blue);
  }, end:() => { Mi.setRings(0); T.m.flagged = 1; }});
  K.stamp(Mi, ['Claim exceeds data', `by ${gap} ${u}`], 'The gap between claim and verified data shows up only now, weeks after the claim was filed.', 8, 'Registry');
  K.check(Mi, 'The legal unit checks a draft decision on the reduced amount against the scheme rules. Typically several days.', 72, 2600);

  // 25–27 · decision letter, appeal path (not used here) and the committee
  K.travel(Mi, Co, D('DECISION'), 'The ministry sends the decision on the reduced amount by post. The company may appeal within a set period.', 48, {count:'docs', burn:false, bend:-60});
  K.add({dur:1500, sim:336, cap:'The appeal period runs. Illustrative: two weeks. No appeal is filed here; an appeal would be reviewed by a person.', run:p => Co.setFlash(.2*Math.sin(Math.PI*p*2))});
  K.add({dur:1500, sim:336, cap:'The claim waits for the monthly approval committee. The next sitting may be weeks away.', run:p => Mi.setFlash(.25*Math.sin(Math.PI*p*2))});
  K.stamp(Mi, ['Committee approves', `Subsidy ${g10Short(g.sub, cur)}`], `The committee approves ${sub} for the verified quantity.`, 8, 'Committee');

  // 29–33 · the paper payment order, the treasury check, the batch and the release of the commitment
  K.travel(Mi, Tr, D('ORDER'), 'The ministry sends a paper payment order to the treasury, signed by two officials.', 24, {count:'docs', burn:false, bend:0});
  K.check(Tr, 'The treasury checks the order against the commitment and the signatures on file. A mismatch goes back to the ministry.', 24, 2600);
  K.add({dur:1500, sim:168, cap:'The order waits in the treasury’s next payment batch. Batches often run weekly or monthly. The commitment stays in place.', run:p => Tr.setFlash(.25*Math.sin(Math.PI*p*2))});
  K.release(Tr, 'The payment run releases the commitment. The approved amount is paid; the rest returns to the scheme budget.', 4);

  // 34–37 · payment through the central bank’s system, the bank’s reconciliation, the company’s books and the archive
  K.coins(coins, Tr, Bk, `The treasury pays ${sub} through the central bank’s payment system to the company’s bank. Settlement is same day or next day, depending on the system.`, 6, {bend:-230, end:() => { T.m.paid = 1; }});
  K.check(Bk, 'The bank credits the company’s account. Where the payment reference is missing or wrong, staff match the payment by hand.', 24, 2600);
  K.travel(Bk, Co, D('STATEMENT'), 'The bank sends a statement line to the company, on paper or as a PDF. The company reconciles it against its own ledger.', 24, {count:'docs', burn:false, bend:-30});
  K.badge([[Co, 'ok']], `${co} is paid. The evidence sits in paper files at three offices: the ministry, the verifier and the treasury.`, 2);
  K.badge([[Mi, 'ok']], 'The ministry files the paper case. The audit office may sample it later, and the evidence is rebuilt from paper.', 0);

  T.rows = () => [
    ['Commitments active', String(T.m.holds), T.m.holds > 0],
    ['Budget committed now', money(T.holdAmount*T.m.holds, cur), T.m.holds > 0],
    ['Time committed', T.m.holdTime > 0 ? fmtDur(T.m.holdTime, T.unit) : '—', false],
    R.docs(T),
    ['Claim vs verified data', T.m.flagged ? `gap of ${gap} ${u}` : '—', !!T.m.flagged]
  ];
  T.extraSummary = () => [['Claim vs verified data', `${clT} claimed, ${qtyT} verified`]];
  T.doneText = 'Paid months after the claim, in this illustration. The gap between claim and data showed up only when the ministry re-keyed the verified figure, and the evidence sits in paper files at three offices.';
}

/* ---------- With AFC: one payout, five steps, inside one process space ----------
   Institutions sit outside and reach the process only through the gateway. No institution is linked to an internal
   part or to another institution. The anchors take money on their reserve accounts; they never take requests.
   AFC is not drawn: the captions name it as the component that routes the request. */
function g10Afc(T, K){
  const g = g10Cfg(T), {org, co, cur, u} = g, sub = money(g.sub, cur), qtyT = `${g.n(g.qty)} ${u}`;
  T.holdAmount = g.sub;
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${cur}`, 'Treasury leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${cur}`, 'Bank leg']
  ]);
  const I = space.inside;
  const xs = [125, 315, 500, 685, 875], mk = (x, label, sb) => makeNode(T, {x, y:INST_Y, r:34, small:true, label, sub:sb});
  const Co = mk(xs[0], g10Fit(co, 20), 'Applicant');
  const Vr = mk(xs[1], 'Verifier', 'Accredited');
  const Mi = mk(xs[2], g10Fit(org, 22), 'Scheme owner');
  const Tr = mk(xs[3], 'Treasury', 'Payer');
  const Bk = mk(xs[4], 'Company’s bank', 'Receiving bank');
  space.connect([Co, Vr, Mi, Tr, Bk]);
  const funds = makeCoins(T.layers.tokens, cur, 3, Tr.x, space.busY, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 3, I.chain.x, I.chain.y + 16, 0);
  const pot = space.sig(), ft = floatText(T.layers.fx, I.chain.x, I.chain.y - 42, '1 = 1', C.afc);
  const sparks = [Vr, Mi, Tr].map(n => ({n, s:space.sig()}));

  // 1 of 5 · request: the signed result, the approval and the confirmed payment reach the gateway; AFC routes the request
  g10Beat(T, K, `1 of 5 · Request. The confirmed payment arrives through the gateway with the signed result for ${qtyT} and the ministry’s approval. AFC routes it.`, 72, S => {
    S.add({dur:900, run:p => { const a = Math.min(seg(p,0,.15), 1 - seg(p,.85,1)); [Vr, Mi, Tr].forEach(n => n.setRings(a)); }, end:() => [Vr, Mi, Tr].forEach(n => n.setRings(0))});
    S.add({dur:1100, start:() => { T.m.api += 3; }, run:p => { sparks.forEach(({n, s}) => s.set(n.x, lerp(n.y - n.r, space.busY, ease(p)), fade(p, .1, .9))); space.glow(p > .85); }});
    S.badge([[Vr, 'ok'], [Mi, 'ok'], [Tr, 'ok']], '', 0);
    S.add({dur:600, run:p => space.scan(p, Math.sin(Math.PI*p)*.8), end:() => space.scan(0, 0)});
  });

  // 2 of 5 · accept: the anchor takes the treasury’s funds on its reserve account; the transaction is confirmed
  g10Beat(T, K, `2 of 5 · Accept. The anchor accepts the treasury’s ${cur} on its reserve account. AFC checks the arrived funds against the request.`, .05, S => {
    S.coins(funds, Tr, I.fromAnchor, '', 0, {from:[Tr.x, space.busY], fadeOut:true, dur:1300, bend:-245});
    S.check(I.fromAnchor, '', 0, 900);
    S.badge([[I.fromAnchor, 'ok']], '', 0);
  });

  // 3 of 5 · issue: only after acceptance the proof of transaction goes to NodeChain; ArosCoin is issued 1 = 1
  g10Beat(T, K, `3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1 against the confirmed ${cur}.`, .05, S => {
    S.add({dur:1100, start:() => { T.m.pot++; }, run:p => {
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y, (I.fromAnchor.x + I.chain.x)/2, I.fromAnchor.y - 56, I.chain.x, I.chain.y, ease(p));
      pot.set(x, y, fade(p, .05, .9));
    }});
    S.badge([[I.chain, 'ok']], '', 0);
    S.add({dur:900, run:p => { aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)); ft.set(p); }});
  });

  // 4 of 5 · accept and convert: the payout anchor takes ArosCoin and converts it 1 = 1 into the payout currency
  g10Beat(T, K, `4 of 5 · Accept and convert. The payout anchor accepts ArosCoin and converts it into ${cur}, 1 = 1. AFC checks its reserve.`, .05, S => {
    S.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true, dur:1200, arrive:() => aro.recur(cur)});
    S.check(I.toAnchor, '', 0, 900);
    S.badge([[I.toAnchor, 'ok']], '', 0);
  });

  // 5 of 5 · output: the bank is credited on its own books; notices leave through the gateway; the process ends
  g10Beat(T, K, `5 of 5 · Output. The company’s bank is credited ${sub} on its own books. Notices go to the company and the ministry through the gateway. The process ends here.`, .05, S => {
    settleStep(T, S, I.toAnchor, Bk, cur, cur, '', 0, 1000);
    S.check(Bk, '', 0, 900);
    S.badge([[Bk, 'ok'], [Tr, 'ok']], '', 0);
    notify(T, S, space, Co, '', 0);
    notify(T, S, space, Mi, '', 0);
    S.add({dur:300, end:() => { T.m.paid = 1; }});
  });

  T.rows = () => [
    ['Holds on this track', String(T.m.holds), false],
    R.api(T),
    R.docs(T),
    ['Token before acceptance', '0', false],
    ['Paid on', T.m.paid ? 'verified, signed data' : '—', false]
  ];
  T.extraSummary = () => [['Claim vs verified data', 'checked on signed data before payment']];
  T.doneText = 'Done. Paid on the signed result. The five AFC steps took minutes; the on-site check still took about three days, as it does today. The ministry’s approval remains its own check.';
}

GOV.push({
  key:'gov-carbon', no:'G10', group:'Government',
  name:'Carbon & energy subsidy', sub:'Paper claim vs verifier-signed data',
  inputs:[ {id:'org', label:'Your ministry', type:'text', def:'Ministry of Energy'},
           {id:'company', label:'Company', type:'text', def:'Riverside Steel'},
           {id:'from', label:'Currency', type:'currency', def:'EUR'},
           {id:'basis', label:'Subsidy paid per', type:'select', options:['t CO2e avoided', 'MWh saved'], def:'t CO2e avoided'},
           {id:'rate', label:'Rate per unit', type:'number', def:40, min:1, max:10000},
           {id:'qty', label:'Verified quantity', type:'number', def:25000, min:1, max:10000000} ],
  lede:'A ministry pays a subsidy for verified energy savings or avoided emissions. Today a paper claim goes through a desk queue, a site check, a committee and a payment run. With AFC, an accredited verifier signs the measured data and the payout follows that signed evidence.',
  note:'Illustrative model. Rates, quantities, waiting times and the company’s figure are examples, not scheme terms, service levels or statistics. Schemes differ by country: some take claims through a portal, some have no committee, and some add an appeal before payment. The claim is the company’s own figure; here it is 20% above the verified quantity, to show the gap. The on-site check takes about three days in both routes, and the With-AFC clock starts with it. The With-AFC track shows one payout in five steps. The verifier signs the measured result on its own circle, the ministry approves the verified quantity on its own circle and the treasury checks its own budget line. A mismatch goes to a person for review; nothing is denied automatically. The With-AFC track has no holds: no padlock and no waiting in escrow. AFC does not measure, accredit, approve, deny or hold money. It checks the verifier’s signature and that the verifier is on the rule’s accredited list; accreditation stays with the national accreditation body. Funds are accepted on an anchor’s reserve account, and the payout settles on the company’s bank’s own books. Where the scheme requires a committee, its meeting date still applies; the track does not shorten it. Proof of transaction is recorded only where the law allows. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Paper claim, desk queue, site check', vbH:460, unit:'h', build:g10Today},
  next:{tag:'With AFC', title:'Signed verifier data, five AFC steps', vbH:420, unit:'h', build:g10Afc}
});
