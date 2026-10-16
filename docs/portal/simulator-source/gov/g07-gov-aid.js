/* ================= G07 · Aid and grants ================= */
// Today: a grant agreement on paper, a withdrawal application, manual reviews by the donor, a manual FX conversion at the
// converting bank, a designated-account hold until the budget release is signed, a project report on paper with beneficiary
// lists attached, and a donor review that withholds the next tranche. An impact audit rebuilds the evidence years later.
// With AFC: one tranche through five steps. The verifier signs milestone evidence on its own circle; the donor's approved
// request reaches AFC through the gateway; the USD anchor accepts the funds; PoT and ArosCoin 1 = 1; the payout anchor
// converts; the treasury is credited on its own books. No holds: every condition is a check on the institution's own circle.
function g07Vars(T){
  const v = T.cfg.v, {from, to, amount} = T.cfg, k = Math.max(1, Math.min(4, Math.round(v.k || 3)));
  return {org: v.org || 'Development Fund', country: v.country || 'Country A', from, to, fx: from !== to, amount, k,
    amt: money(amount, from), trT: money(amount/k, from), trWord: k > 1 ? 'tranches' : 'tranche'};
}
function g07Short(s, n=23){ return s.length > n ? s.slice(0, n - 1) + '…' : s; }
function g07Compact(v, cur){
  try { return new Intl.NumberFormat('en', {style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); }
  catch { return Math.round(v).toLocaleString('en') + ' ' + cur; }
}
// The recipient country: a tinted area with the country name.
function g07Country(T, country, x1, y1, x2, y2, lx, ly){
  svgEl('rect', {x:x1, y:y1, width:x2 - x1, height:y2 - y1, rx:16, fill:'#F6F8FA', stroke:C.muted, 'stroke-width':1.1, 'stroke-dasharray':'6 6'}, T.layers.paths);
  const t = svgEl('text', {x:lx, y:ly, 'text-anchor':'end', 'font-size':12, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, T.layers.paths);
  t.textContent = `RECIPIENT · ${country.toUpperCase()}`;
}
// Tranche tracker for Today: one slot per tranche, filled when the tranche is released, with a one-line status.
function g07Tracker(T, k, amount, cur, x, y, w){
  const g = svgEl('g', null, T.layers.fx), gap = 8, sw = (w - gap*(k - 1))/k, slots = [];
  const hd = svgEl('text', {x, y, 'font-size':11.5, 'letter-spacing':1.5, 'font-weight':600, fill:C.muted}, g);
  hd.textContent = `GRANT ${g07Compact(amount, cur)} · ${k} ${k > 1 ? 'TRANCHES' : 'TRANCHE'}`;
  for (let i = 0; i < k; i++) {
    const sx = x + i*(sw + gap);
    const r = svgEl('rect', {x:sx, y:y + 12, width:sw, height:40, rx:7, fill:'#FFFFFF', stroke:C.rail, 'stroke-width':1.3}, g);
    const t1 = svgEl('text', {x:sx + sw/2, y:y + 29, 'text-anchor':'middle', 'font-size':13, 'font-weight':700, fill:C.muted}, g); t1.textContent = 'T' + (i + 1);
    const t2 = svgEl('text', {x:sx + sw/2, y:y + 45, 'text-anchor':'middle', 'font-size':11, fill:C.muted}, g); t2.textContent = g07Compact(amount/k, cur);
    slots.push({r, t1, t2});
  }
  const st = svgEl('text', {x, y:y + 74, 'font-size':12.5, fill:C.ink}, g); st.textContent = 'No tranche released yet';
  return {
    set(i, on){ const s = slots[i]; s.r.setAttribute('fill', on ? '#E6F6EE' : '#FFFFFF'); s.r.setAttribute('stroke', on ? C.ok : C.rail); s.t1.setAttribute('fill', on ? C.ok : C.muted); s.t2.setAttribute('fill', on ? C.ok : C.muted); },
    status(text){ if (st.textContent !== text) st.textContent = text; }
  };
}
// Tranche chips for With AFC: a compact row at the foot of the track, with one status line beside it.
function g07Chips(T, k, x, y, w, initial){
  const g = svgEl('g', null, T.layers.fx), gap = 6, cw = (w - gap*(k - 1))/k, chips = [];
  for (let i = 0; i < k; i++) {
    const sx = x + i*(cw + gap);
    const r = svgEl('rect', {x:sx, y, width:cw, height:20, rx:6, fill:'#FFFFFF', stroke:C.rail, 'stroke-width':1.3}, g);
    const t = svgEl('text', {x:sx + cw/2, y:y + 14, 'text-anchor':'middle', 'font-size':11, 'font-weight':700, fill:C.muted}, g); t.textContent = 'T' + (i + 1);
    chips.push({r, t});
  }
  const st = svgEl('text', {x:x + w + 14, y:y + 14, 'font-size':12.5, fill:C.ink}, g); st.textContent = initial;
  return {
    set(i, on){ const c = chips[i]; c.r.setAttribute('fill', on ? '#E6F6EE' : '#FFFFFF'); c.r.setAttribute('stroke', on ? C.ok : C.rail); c.t.setAttribute('fill', on ? C.ok : C.muted); },
    status(text){ if (st.textContent !== text) st.textContent = text; }
  };
}
// Coins along a chain of nodes (centre to centre); converts at the FX node.
function g07Along(stops, p){
  const n = stops.length - 1, f = clamp(p)*n, i = Math.min(n - 1, Math.floor(f)), q = ease(f - i);
  return [lerp(stops[i][0], stops[i + 1][0], q), lerp(stops[i][1], stops[i + 1][1], q), i];
}
// One With-AFC step is one animation call. Its parts (checks, sparks, coins, notices) run back to back inside it,
// so the viewer's step counter matches the captions "n of 5".
function g07Beat(T, K, cap, sim, fill){
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

function g07Today(T, K){
  const {org, country, from, to, fx, amount, k, amt, trT, trWord} = g07Vars(T), Y = 215, cy = Y + 16;
  g07Country(T, country, 505, 20, 985, 462, 970, 454);
  const D = makeNode(T, {x:130, y:Y, r:48, label:org, sub:'Donor · IFI', lockAt:[-48, -73]});
  const F = makeNode(T, {x:370, y:Y, r:48, label:'Converting bank', sub:fx ? `FX ${from} → ${to}` : 'Correspondent'});
  const Tr = makeNode(T, {x:630, y:Y, r:48, label:'Treasury', sub:'State treasury', lockAt:[-48, -73]});
  const L = makeNode(T, {x:860, y:Y, r:48, label:'Local bank', sub:'Implementing bank'});
  const P = makeNode(T, {x:740, y:392, r:38, labelPos:'right', label:'Local project', sub:'Beneficiaries'});
  const A = makeNode(T, {x:300, y:378, r:30, label:'Impact auditor', sub:'', hidden:true});
  const tk = g07Tracker(T, k, amount, from, 30, 352, 200);
  const coins = makeCoins(T.layers.tokens, from, 3, D.x, cy, 0);
  const usdTr = T.amountUSD == null ? null : T.amountUSD/k;
  const route = [[D.x, cy], [F.x, cy], [Tr.x, cy], [L.x, cy], [P.x, P.y + 14]];
  const redDoc = label => { const d = makeDoc(T.layers.tokens, label); d.g.lastChild.setAttribute('fill', C.hold); return d; };
  const holdTxt = fx ? money((amount/k) / (RATES[from] || 1) * (RATES[to] || 1), to) : money(amount/k, from);
  T.holdAmount = amount/k; T.m.tr = 0; T.m.pd = false;

  // 1 · the approval and the agreement, on paper
  K.pulse(D, `${org} approves a ${amt} grant for ${country}, paid in ${k} ${trWord} against milestones. Its own committee minutes the decision.`);
  K.travel(D, Tr, makeDoc(T.layers.tokens, 'GRANT AGREEMENT'), 'The terms are negotiated by e-mail. The signed paper original is couriered to the treasury. Some countries also require ratification.', 168, {count:'docs', bend:-150});
  K.check(Tr, `The treasury registers the agreement after checking it against ${country}’s aid and debt rules. The time varies by country.`, 240);
  K.stamp(Tr, ['Agreement signed', 'Budget line set'], 'The grant is entered in the state budget. No money has moved.', 24, g07Short(country));
  K.check(Tr, 'The designated account is opened after paper forms and signature samples are checked by hand.', 120, 2400);

  // 2 · the withdrawal application for tranche 1, and the donor's review
  K.travel(Tr, D, makeDoc(T.layers.tokens, 'APPLICATION'), 'Tranche 1: the treasury files a withdrawal application on paper, with a progress statement and bank details.', 96, {count:'docs', bend:165, burn:false});
  K.check(D, 'The donor’s fiduciary team checks the application against the agreement and its own procurement rules.', 168, 2800);
  K.travel(D, Tr, makeEnvelope(T.layers.tokens, null, 'QUERY'), 'The donor asks for a missing signature and a newer bank statement. Each query round takes days or weeks.', 72, {count:'msgs', bend:-150, burn:false});
  K.travel(Tr, D, makeDoc(T.layers.tokens, 'DOCUMENTS'), 'The treasury returns the documents by courier. The file is reopened, and the review starts again.', 120, {count:'docs', bend:165, burn:false});
  K.stamp(D, ['Application checked', 'Approval signed'], `${org} signs the approval letter for tranche 1. The approval is on paper, not in a shared system.`, 24, g07Short(org));

  // 3 · payment through the converting bank, with a manual conversion and clearing
  K.travel(D, F, makeEnvelope(T.layers.tokens, null), 'The donor’s bank sends a payment message for the tranche to the converting bank in the recipient country.', 24, {count:'msgs'});
  K.check(F, 'The converting bank screens the payment: sanctions lists, the donor’s bank details and its own FX limits.', 4, 2600);
  K.stamp(F, ['Screening passed', fx ? 'FX rate quoted' : 'Fee quoted'], fx ? 'The bank quotes its own rate. Its dealing desk sets the spread, not the donor.' : 'The correspondent quotes its fee. No currency conversion is needed.', 6);
  K.coins(coins, D, F, `Tranche 1, ${trT}, leaves in ${from}. Banks process payments in batches, so the credit can take a day.`, 24, {end:() => tk.status('Tranche 1 · in transit')});
  K.coins(coins, F, Tr, fx ? `The converting bank converts ${from} into ${to} at its quoted rate and keeps its spread.` : 'The correspondent passes the funds on and takes its fee.', 48,
    {fee:fx ? 'spread' : `−${usd(FEE.corr)}`, arrive:() => { if (fx) coins.recur(to); }, end:() => T.addFee(fx ? (usdTr == null ? null : usdTr*FEE.spread) : FEE.corr)});
  K.stamp(Tr, ['Credit received', 'Matched by hand'], 'The treasury matches the credit line by line against its approval letter. This is a manual reconciliation.', 24);

  // 4 · the designated account holds the money until the budget release is signed (a real hold)
  K.hold(Tr, holdTxt, 'The funds wait on the designated account. Nothing moves until the budget release is signed. This hold is real.', 24);
  K.check(Tr, 'Budget release: the ministry of finance and the treasury sign it in turn, on paper or as scanned e-mail.', 168, 2800);
  K.release(Tr, 'The payment order is signed and the hold on the designated account is lifted.', 24);
  K.coins(coins, Tr, L, 'The payment order is signed and the hold lifted. The order goes to the implementing bank through the local clearing system.', 48,
    {end:() => { T.m.tr = 1; tk.set(0, true); tk.status(`Released 1 of ${k} · at the local bank`); }});
  K.check(L, 'The implementing bank checks the payment order and the sanctions list under its own rules.', 6, 2200);
  K.stamp(L, ['Order matched', 'Account credited'], 'The implementing bank credits the project account.', 6);

  // 5 · the project spends, reports on paper and sends personal data to the donor
  K.check(P, 'The project runs its own tenders. Where the donor requires it, each large contract also needs a no-objection.', 336, 2800);
  K.travel(P, D, makeDoc(T.layers.tokens, 'NO-OBJECTION'), 'The project asks the donor for a no-objection on each large contract, by letter. The wait varies.', 240, {count:'docs', bend:-150, burn:false});
  K.coins(coins, L, P, 'The project pays local suppliers and beneficiaries from its own accounts, in cash or by bank transfer.', 72,
    {fadeOut:true, end:() => tk.status(`Released 1 of ${k} · spent by the project`)});
  K.travel(P, Tr, redDoc('REPORT + NAMES'), 'In this example the project reports progress on paper, with beneficiary lists attached: names, IDs, addresses.', 336, {count:'docs', bend:90});
  K.travel(Tr, D, redDoc('REPORT + NAMES'), 'In this example the treasury forwards the report to the donor abroad by e-mail, personal data included.', 72, {count:'docs', bend:165, burn:false});
  T.steps[T.steps.length - 1].end = () => { T.m.pd = true; };

  // 6 · the donor reviews, asks questions, and holds the next tranche until it accepts the report
  K.check(D, 'The donor reviews the report. Questions go back and forth by e-mail. The wait is typically weeks.', 240, 2800);
  K.travel(D, P, makeDoc(T.layers.tokens, 'QUERY'), 'The donor finds names missing from a list and asks the project to fix it. The project corrects the lists by hand.', 168, {count:'msgs', bend:150});
  K.travel(P, D, redDoc('LISTS, FIXED'), 'In this example the corrected lists go back to the donor, with the same personal data.', 120, {count:'docs', bend:-150, burn:false});
  K.hold(D, money(amount/k, from), 'Real hold: the donor withholds the next tranche until it accepts the report. The money has not moved.', 24);
  K.release(D, 'The donor accepts the report and releases the next tranche. Each later tranche repeats the same route.', 240);

  // Tranches 2 and later: the same loop, one step each
  for (let i = 1; i < k; i++) {
    const c = makeCoins(T.layers.tokens, from, 2, D.x, cy, 0);
    K.add({dur:2600, sim:1500, cap:`Tranche ${i + 1}: the same loop repeats. Application, review, conversion, budget release, and another report with names.`,
      start:() => { T.m.docs += 3; tk.status(`Tranche ${i + 1} · application and review`); },
      run:p => { const [x, y, s] = g07Along(route, seg(p, 0, .9)); if (fx && s >= 1 && c.cur !== to) c.recur(to); c.set(x, y, Math.min(seg(p, 0, .05), 1 - seg(p, .92, 1))); },
      end:() => { T.m.tr = i + 1; tk.set(i, true); tk.status(`Released ${i + 1} of ${k}`); T.addFee(fx ? (usdTr == null ? null : usdTr*FEE.spread) : FEE.corr); }});
  }

  // Years later, outside this clock
  K.travel(D, A, makeDoc(T.layers.tokens, 'ALL REPORTS'), 'Years later, outside this clock, an impact audit rebuilds the evidence from reports and site samples.', 0, {count:'docs', bend:-90});
  K.add({dur:1600, sim:0, cap:'Impact is rebuilt after the money is spent. In this example the beneficiaries’ personal data travelled abroad with every report.',
    run:p => { const a = Math.sin(Math.PI*p); A.setRings(a); P.setFlash(.5*a); }, end:() => A.setRings(0)});

  T.rows = () => [R.holds(T), R.onHold(T), R.docs(T), ['Tranches released', `${T.m.tr} of ${k}`, false], ['Personal data sent abroad', T.m.pd ? 'lists, in this example' : '—', T.m.pd]];
  T.extraSummary = () => [['Fees & FX spread', T.feesText()], ['Personal data sent to the donor', 'beneficiary lists, in this example'], ['Impact evidence', 'rebuilt years later']];
  T.doneText = `Done. ${k > 1 ? `Each of the ${k} tranches` : 'The tranche'} waited for paper reviews, personal data crossed borders in this example, and impact was pieced together at the end.`;
}

function g07Afc(T, K){
  const {org, from, to, fx, amount, k, trT, trWord} = g07Vars(T);
  // The process space: anchors (one per fiat leg) and NodeChain inside the frame. AFC is not drawn; captions name it.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Accepts'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${to}`, 'Pays out']
  ]);
  const I = space.inside;
  // Outside the frame: institutions only, each reaching the process through the gateway. None is linked to an internal part or to another institution.
  const xs = [125, 320, 500, 680, 860], mk = (x, label, sub) => makeNode(T, {x, y:INST_Y, r:32, small:true, label, sub, lockAt:[70, -20]});
  const D = mk(xs[0], org, 'Donor · IFI');
  const F = mk(xs[1], 'Converting bank', fx ? `FX ${from} → ${to}` : 'Correspondent');
  const Tr = mk(xs[2], 'Treasury', 'State treasury');
  const P = mk(xs[3], 'Local project', 'Beneficiaries');
  const V = mk(xs[4], 'Verifier', 'Independent');
  space.connect([D, F, Tr, P, V]);
  const funds = makeCoins(T.layers.tokens, from, 3, D.x, D.y + 16, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 3, I.chain.x, I.chain.y + 16, 0);
  const pot = space.sig(), ft = floatText(T.layers.fx, I.chain.x, I.chain.y - 42, '1 = 1', C.afc);
  const tk = g07Chips(T, k, 30, 396, 200, `Grant ${g07Compact(amount, from)} in ${k} ${trWord} · none released`);
  const usdTr = T.amountUSD == null ? null : T.amountUSD/k;
  T.m.tr = 0; T.m.protoFee = false;

  // 1 of 5 · request: the verifier's signed milestone evidence and the donor's approval reach the gateway; AFC routes the request
  g07Beat(T, K, `1 of 5 · Request. After a site visit of days, the verifier signs milestone 1 and AFC checks it. The donor approves tranche 1 (${trT}). AFC routes it to the ${from} anchor.`, 72, S => {
    S.add({dur:1600, run:p => { const a = Math.min(seg(p, 0, .15), 1 - seg(p, .85, 1)); [V, P, Tr].forEach(n => n.setRings(a)); }, end:() => [V, P, Tr].forEach(n => n.setRings(0))});
    S.api(V, space, '', 0);
    S.badge([[V, 'ok']], '', 0);
    S.api(D, space, '', 0);
    S.badge([[D, 'ok']], '', 0);
    S.add({dur:800, run:p => space.scan(p, Math.sin(Math.PI*p)*.8), end:() => space.scan(0, 0)});
  });

  // 2 of 5 · accept: the fiat anchor accepts the funds on its reserve; AFC checks them against the request
  g07Beat(T, K, `2 of 5 · Accept. The ${from} anchor accepts the funds on its reserve account for AFC. AFC checks the arrived funds against the request.`, 1.5, S => {
    S.coins(funds, D, I.fromAnchor, '', 0, {fadeOut:true, dur:1300});
    S.add({dur:900, run:p => I.fromAnchor.setFlash(.5*Math.sin(Math.PI*p))});
    S.badge([[I.fromAnchor, 'ok']], '', 0);
  });

  // 3 of 5 · issue: only after acceptance, the proof of transaction goes to NodeChain; AST issues ArosCoin 1 = 1
  g07Beat(T, K, `3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1 against the ${from} funds.`, 1, S => {
    S.add({dur:1100, start:() => { T.m.pot++; T.m.protoFee = true; }, run:p => {
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y, (I.fromAnchor.x + I.chain.x)/2, I.fromAnchor.y - 56, I.chain.x, I.chain.y, ease(p));
      pot.set(x, y, fade(p, .05, .9));
    }});
    S.badge([[I.chain, 'ok']], '', 0);
    S.add({dur:900, run:p => { aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)); ft.set(p); }, end:() => tk.status('Tranche 1 · recorded in NodeChain')});
  });

  // 4 of 5 · accept and convert: the payout anchor accepts ArosCoin and converts it at the quoted rate
  g07Beat(T, K, fx
    ? `4 of 5 · Accept and convert. The ${to} anchor accepts ArosCoin and converts it at the rate the converting bank quoted. The bank keeps its spread.`
    : '4 of 5 · Accept. The payout anchor accepts ArosCoin 1 = 1. No conversion is needed, because the local currency is the grant currency.', 1.2, S => {
    S.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true, dur:1200, arrive:() => { if (fx) aro.recur(to); }});
    S.check(F, '', 0, 900);
    S.badge([[F, 'ok']], '', 0);
    S.badge([[I.toAnchor, 'ok']], '', 0);
    S.add({dur:300, end:() => T.addFee(fx ? (usdTr == null ? null : usdTr*FEE.spread) : 0)});
  });

  // 5 of 5 · output: the treasury is credited on its own books; the donor gets a notice through the gateway
  g07Beat(T, K, '5 of 5 · Output. The treasury is credited on its own books. The donor gets a notice with signed results and no personal data. The process ends here.', 1.2, S => {
    settleStep(T, S, I.toAnchor, Tr, to, to, '', 0, 1000);   // the payout settles on the treasury's books
    S.check(Tr, '', 0, 900);
    S.badge([[Tr, 'ok']], '', 0);
    notify(T, S, space, D, '', 0);
    S.add({dur:300, end:() => { T.m.tr = 1; tk.set(0, true); tk.status(`Released 1 of ${k} · on signed evidence${k > 1 ? ' · next: milestone 2' : ''}`); }});
  });

  T.rows = () => [R.holds(T), ['Tranches released', `${T.m.tr} of ${k}`, false], R.api(T), ['Personal data sent abroad', 'none', false], R.fees(T)];
  T.extraSummary = () => [['Fees & FX spread', T.feesText()], ['Personal data sent to the donor', 'none, evidence only'], ['Impact evidence', 'signed at each milestone']];
  T.doneText = k > 1
    ? `Done. Tranche 1 of ${k} was released on signed evidence. Tranches 2 to ${k} repeat the same five steps on their own milestones. The donor saw results, not personal data.`
    : 'Done. The tranche was released on signed evidence. The donor saw results, not personal data, and NodeChain holds the record for the impact review.';
}

GOV.push({
  key:'gov-aid', no:'G07', group:'Government',
  name:'Aid and grants', sub:'Paper reports vs signed milestones',
  inputs:[{id:'org', label:'Donor or IFI', type:'text', def:'Development Fund'},
          {id:'country', label:'Recipient country', type:'text', def:'Country A'},
          {id:'from', label:'Grant currency', type:'currency', def:'USD'},
          {id:'to', label:'Local currency', type:'currency', def:'GEL'},
          {id:'amount', label:'Grant amount', type:'amount', def:10000000},
          {id:'k', label:'Tranches', type:'number', def:3, min:1, max:4}],
  lede:'A donor funds a project abroad in tranches. Today each tranche waits on paper approvals and reports that carry beneficiaries’ personal data across borders. With AFC each tranche follows milestone evidence signed by an independent verifier, and the donor sees results, not personal records.',
  note:'Illustrative model. Timings, amounts and FX rates are examples, not quotes or service levels. The Today track assumes that reports carry beneficiary lists; many donors accept aggregated data, and approval routes vary by country. The With-AFC track shows one tranche through five steps; later tranches repeat the same steps on their own milestones and are counted, not animated. The track does not judge the work: the verifier is independent of both sides and signs the evidence; AFC checks the signature and the contract state. It has no holds: each condition is a check on the responsible institution’s own circle. It does not build local capacity, and it does not convert currency: the converting bank quotes the rate and keeps its spread. AFC is a logical process layer: it holds no funds, issues no money and is not a party to settlement; anchors hold their own reserves and the treasury keeps the grant on its own books. Site visits still take days, and the project work and the final impact evaluation sit outside both clocks. The protocol (PoT) fee has no amount until its tariff is set. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Applications, paper reports, late audit', vbH:470, unit:'h', build:g07Today},
  next:{tag:'With AFC', title:'Tranches on signed milestone evidence', vbH:420, unit:'h', build:g07Afc}
});
