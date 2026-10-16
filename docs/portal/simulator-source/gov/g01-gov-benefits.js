/* ================= G01 · Targeted benefits ================= */
// Today: the budget is pre-funded to a bank, the list travels as a file, a duplicate is paid and found at audit.
// With AFC: the ministry decides eligibility on its own registry, the treasury funds only cleared payments, flagged records go to a caseworker.
const g01Shop = {'Food':'Grocery shop', 'Utilities':'Utility company', 'School costs':'School supplier'};
function g01Vars(T){
  const v = T.cfg.v, {from, amount} = T.cfg;
  const n = Math.max(2, Math.min(6, Math.round(v.n || 4))), per = v.per || 150, use = v.use || 'Food';
  return {org: v.org || 'Ministry of Welfare', from, amount, n, per, use, useT: use.toLowerCase(),
    amt: money(amount, from), perT: money(per, from), reach: Math.max(1, Math.floor(amount/per)).toLocaleString('en'),
    shop: g01Shop[use] || 'Local merchant'};
}
// Stamp titles are one short line: long institution names are cut.
function g01Short(s, n=23){ return s.length > n ? s.slice(0, n - 1) + '…' : s; }
// A beneficiary circle with a person mark drawn inside the node body (so it floats and fades with the node).
function g01Person(T, x, y, r, o={}){
  const n = makeNode(T, {x, y, r, small:true, labelPos:'right', label:o.label || '', sub:o.sub || '', hidden:!!o.hidden});
  const g = T.layers.nodes.lastElementChild, body = g.children[1], col = o.ghost ? C.muted : C.ink, s = r/26;
  if (o.ghost) { body.firstChild.setAttribute('stroke-dasharray', '5 4'); body.firstChild.setAttribute('stroke', C.muted); }
  svgEl('circle', {cx:0, cy:-13*s, r:4.6*s, fill:'#FFFFFF', stroke:col, 'stroke-width':1.6}, body);
  svgEl('path', {d:`M${-9*s},${1*s} Q${-9*s},${-6.5*s} 0,${-6.5*s} Q${9*s},${-6.5*s} ${9*s},${1*s}`, fill:'none', stroke:col, 'stroke-width':1.6, 'stroke-linecap':'round'}, body);
  n.grp = g;
  return n;
}
// The beneficiaries shown, stacked in a column; the last circle is a duplicate record of the person above it.
function g01People(T, n, x){
  const k = n + 1, sp = Math.min(76, 380/(k - 1)), y0 = 235 - sp*(k - 1)/2, P = [];
  for (let i = 0; i < n; i++) P.push(g01Person(T, x, y0 + i*sp, 26));
  const G = g01Person(T, x, y0 + n*sp, 26, {ghost:true, hidden:true, label:'Duplicate', sub:'record'});
  return {P, G};
}
// A check step (rings on the nodes) during which the second, duplicate record of one person shows up in the list.
function g01CheckList(K, nodes, G, cap, sim, dur=2600){
  nodes = [].concat(nodes);
  K.add({dur, sim, cap, run:p => {
    const a = Math.min(seg(p, 0, .15), 1 - seg(p, .85, 1)); nodes.forEach(x => x.setRings(a));
    G.setPresence(Math.max(G.presence, seg(p, .45, .9)));
  }, end:() => { nodes.forEach(x => x.setRings(0)); G.setPresence(1); }});
}
// Amber "?" mark: the record is waiting for a human review, not refused.
function g01Flag(n){
  const b = svgEl('g', {opacity:0}, n.grp);
  svgEl('circle', {r:11, fill:'#D98E04', stroke:'#FFFFFF', 'stroke-width':2}, b);
  const t = svgEl('text', {x:0, y:.5, 'text-anchor':'middle', 'dominant-baseline':'central', 'font-size':14, 'font-weight':700, fill:'#FFFFFF'}, b); t.textContent = '?';
  return {set(p){ b.setAttribute('opacity', p); b.setAttribute('transform', `translate(${n.r*.72},${-n.r*.72}) scale(${.6 + .4*ease(p)})`); }};
}
// An institution circle takes the same review mark. Call it right after makeNode: the new node group is the last element then.
function g01MarkNode(T, n){ n.grp = T.layers.nodes.lastElementChild; return g01Flag(n); }
// Moves a circle inside an existing node (its position and group), and optionally puts its name and sub-label on the left.
function g01Place(T, n, x, left){
  const g = [...T.layers.nodes.children].find(e => e.getAttribute('transform') === `translate(${n.x},${n.y})`);
  n.x = x; g.setAttribute('transform', `translate(${x},${n.y})`);
  if (!left) return;
  const [l1, l2] = g.children[2].children, lx = -(n.r + 14);
  l1.setAttribute('x', lx); l1.setAttribute('y', -2); l1.setAttribute('text-anchor', 'end');
  l2.setAttribute('x', lx); l2.setAttribute('y', 16); l2.setAttribute('text-anchor', 'end');
}
// Move one glyph along a quadratic path; optionally materialise a hidden node on arrival.
function g01Fly(K, gl, pts, cap, sim, o={}){
  K.add({dur:o.dur || 1300, sim, cap, start:o.start, run:p => {
    const [x, y] = quad(...pts, ease(seg(p, 0, .85))); gl.set(x, y, o.fade ? 1 - seg(p, .9, 1) : 1);
    if (o.reveal && o.reveal.presence < 1) o.reveal.setPresence(Math.max(o.reveal.presence, seg(p, .45, .9)));
    o.run && o.run(p);
  }, end:o.end});
}
// One small coin stack from src to each recipient, staggered; optional rising amount tag beside each recipient.
function g01Fan(T, K, src, list, cur, cap, sim, o={}){
  const k = list.length, st = k > 1 ? .3/(k - 1) : 0, sy = src.y + 16;
  const cs = list.map(() => makeCoins(T.layers.tokens, cur, 1, src.x, sy, 0));
  const fts = list.map(b => { const t = o.tag && o.tag(b); return t ? floatText(T.layers.fx, b.x + b.r + 42, b.y + 6, t, C.ok) : null; });
  K.add({dur:o.dur || 1800, sim, cap, start:o.start, run:p => {
    list.forEach((b, i) => {
      const a = i*st, c = o.ctrl ? o.ctrl(b) : [(src.x + b.x)/2, Math.min(sy, b.y) - 40];
      const [x, y] = quad(src.x, sy, c[0], c[1], b.x, b.y + 12, ease(seg(p, a, a + .62)));
      cs[i].set(x, y, seg(p, a, a + .04));
      fts[i] && fts[i].set(seg(p, a + .5, Math.min(1, a + .98)));
    });
  }, end:o.end});
  return cs;
}

/* ---- Today: the real path, with the holds that are real and the waits that are not ---- */
function g01Today(T, K){
  const {org, from, amount, n, per, useT, amt, perT, reach, shop} = g01Vars(T), Y = 230;
  const Tr = makeNode(T, {x:125, y:Y, r:50, label:'Treasury', sub:'State budget'});
  const M = makeNode(T, {x:365, y:Y, r:50, label:org, sub:'Programme owner'});
  const B = makeNode(T, {x:605, y:Y, r:50, label:'Bank / PSP', sub:'Distributor', hidden:true});
  const S = makeNode(T, {x:585, y:412, r:34, labelPos:'right', label:shop, sub:'Merchant', lockAt:[-104, -4], hidden:true});
  const A = makeNode(T, {x:125, y:412, r:34, labelPos:'right', label:'Audit office', sub:'Auditor', hidden:true});
  const {P, G} = g01People(T, n, 835);
  const budget = makeCoins(T.layers.tokens, from, 4, Tr.x, Y + 16);
  const left = makeCoins(T.layers.tokens, from, 2, B.x, Y + 16, 0);
  const late = makeCoins(T.layers.tokens, from, 1, B.x, Y + 16, 0);
  const arc = [B.x, Y + 16, 365, 56, Tr.x, Y + 16];
  T.holdAmount = amount; T.m.leak = 0;

  // 1 · the ministry opens the run; the treasury authorises the budget on paper
  K.pulse(M, `${org} opens this month’s support run: ${amt}, enough for up to ${reach} people at ${perT} each. ${n} of them are shown here.`);
  K.travel(M, Tr, makeDoc(T.layers.tokens, 'REQUEST'), 'The ministry sends the treasury a signed paper spending request for the month, with the budget line code.', 2, {count:'docs'});
  K.check(Tr, 'The treasury checks the appropriation, the budget line and the ministry’s monthly ceiling in its finance system.', 4);
  K.stamp(Tr, ['Appropriation checked', 'Budget authorised'], 'The treasury signs a release order. It is sometimes still a wet-ink signature, and the release can take several working days (illustrative).', 24);
  K.check(Tr, 'The cash manager confirms that the account at the central bank holds enough cash for the transfer.', 1);

  // 2 · pre-funding: one pattern among several; the whole budget leaves the treasury before anyone is paid
  g01Fly(K, budget, [Tr.x, Y + 16, 365, 56, B.x, Y + 16], 'In this example the whole budget is pre-funded to the bank’s programme account before anyone is paid. Pre-funding is one pattern, not the only one.', 24, {reveal:B});
  K.hold(B, amt, 'The money waits at the bank as a float. It has left the treasury, but no one has been paid from it yet.', 2);
  K.check(B, 'The bank posts the float to its programme account. The money stays there until a payment is made from it.', 1);

  // 3 · the list: caseworkers work from the registry and paper; a duplicate appears when spreadsheets are merged
  g01CheckList(K, M, G, 'Caseworkers check each file on the registry: income, household size and address. Some files are typed in again from paper forms.', 120);
  K.pulse(M, 'In this example, two spreadsheets are merged by hand into one payment list. The same person is now listed twice, under two spellings.', 4);
  K.check(M, 'A second clerk checks the list against the sign-off sheet, page by page (four-eyes rule), and initials each page.', 4);
  K.stamp(M, ['List compiled', 'Eligibility signed off'], 'The ministry signs off the list. The decision is the ministry’s, on its own data. The bank has not seen the list yet.', 24, g01Short(org));

  // 4 · the list reaches the bank as a file; the bank matches it on its own systems
  K.travel(M, B, makeDoc(T.layers.tokens, 'FILE'), 'The list goes to the bank as a file export, uploaded by a clerk. The duplicate goes with it.', 6, {count:'docs'});
  K.check(B, 'The bank matches every name and ID to an account, record by record, in an overnight batch run.', 12, 2600);
  K.check(B, 'Branch staff print the exceptions list and re-key the corrections by hand. The file is run again the next business day.', 24, 2600);
  K.badge([[P[0], 'fail'], ...P.slice(1).map(x => [x, 'ok']), [G, 'ok']],
    'One name does not match its account and is rejected. The same person, listed twice under two spellings, passes both times.', 1);
  K.travel(B, M, makeDoc(T.layers.tokens, 'REJECTED'), 'The rejected record goes back to the ministry by e-mail. That person is left out of this run until the record is corrected.', 24, {count:'docs', bend:50});
  K.pulse(P[0], 'The rejected person calls the helpline. The call is logged on a paper form, not in the bank’s system or the ministry’s.', 2);

  // 5 · payment: every matched record is paid, the duplicate included; the bank nets the batch
  const paid = P.slice(1).concat([G]);
  const cs = g01Fan(T, K, B, paid, from, `The bank pays ${perT} to every matched record, the duplicate included. The rejected person gets nothing this month.`, 24,
    {tag:b => b === G ? null : '+' + perT, end:() => { T.m.leak = per; }});
  K.check(B, 'The bank nets the day’s payments in its batch to the settlement system. Some payments take a day to show on the account.', 24, 2600);
  K.travel(B, M, makeDoc(T.layers.tokens, 'ADVICE'), 'The bank sends a payment advice to the ministry by e-mail: a PDF with totals, not names.', 2, {count:'docs', bend:-60});
  K.check(M, 'The ministry’s finance office checks the bank’s totals by hand against its own list, then enters them in the ledger.', 24, 2600);
  K.pulse(M, 'At the monthly review meeting the rejected records are discussed. In this example the duplicate is not on the agenda.', 24);

  // 6 · the float at month end: real hold, released only when the unused part comes back
  K.add({dur:2000, sim:336, cap:'Month end: the bank reconciles the float. The unused part goes back to the treasury weeks later, after the bank’s own checks.',
    start:() => { budget.set(B.x, Y + 16, 0); left.set(B.x, Y + 16, 1); },
    run:p => { B.releaseLock(seg(p, 0, .3)); const [x, y] = quad(...arc, ease(seg(p, .3, .95))); left.set(x, y, 1); }, end:() => T.holdOff()});
  K.check(Tr, 'The treasury matches the returned amount to the bank statement by hand. Small differences are chased by e-mail for days.', 168, 2600);

  // 7 · the shop: a real wait for the shop, and a permitted-use check made by hand
  K.check(B, `The bank loads the permitted-use list for this programme. ${shop} codes are keyed in by hand from a ministry spreadsheet.`, 48, 2600);
  const buyer = P[n - 1], bc = cs[n - 2];
  g01Fly(K, bc, [buyer.x, buyer.y + 12, 760, Math.max(buyer.y, S.y) + 30, S.x, S.y + 14],
    `A beneficiary buys ${useT} at the ${shop.toLowerCase()}. The cashier checks by hand that the purchase counts as ${useT}.`, 48, {reveal:S});
  K.add({dur:900, sim:.25, cap:'The shop has made the sale and waits for the bank to settle it. The shop is not paid yet.', run:p => S.setLock(p, perT)});
  const sales = makeDoc(T.layers.tokens, 'REPORT');
  K.add({dur:1900, sim:72, cap:'The shop sends its sales report by post or e-mail. The bank checks each sale against the permitted-use list, in a batch.', start:() => { T.m.docs++; },
    run:p => { const [x, y] = quad(S.x - 58, S.y - S.r - 20, 450, 330, B.x - 70, B.y + 26, ease(p)); sales.set(x, y, fade(p)); }});
  K.add({dur:900, sim:24, cap:'The bank settles the shop from the programme float, days after the sale. The shop’s wait ends here.', run:p => S.releaseLock(p)});

  // 8 · the appeal: the person waits for a decision; the fix comes in a supplementary run
  K.travel(P[0], M, makeDoc(T.layers.tokens, 'APPEAL'), 'The person who was left out queues at the ministry office to appeal. Their payment is on hold until the appeal is decided.', 24, {count:'docs', bend:60, burn:false});
  K.check(M, 'The appeals officer collects ID, proof of address and bank details, then decides. This typically takes weeks (illustrative).', 240, 2600);
  K.travel(M, B, makeDoc(T.layers.tokens, 'FIX'), 'The corrected name goes back to the bank as a new paper-based file, re-keyed by a clerk.', 48, {count:'docs', bend:-50});
  g01Fly(K, late, [B.x, Y + 16, 760, 120, P[0].x, P[0].y + 12], 'A supplementary run pays the corrected record. The person has waited for it in full.', 720, {});

  // 9 · the audit, outside this clock: the duplicate is found after the money has left
  K.add({dur:2600, sim:0, cap:'At the next audit, outside this clock, the auditor collects the lists, bank advice and sales reports from the ministry.',
    run:p => { A.setPresence(Math.max(A.presence, seg(p, 0, .4))); A.setRings(Math.min(seg(p, 0, .15), 1 - seg(p, .85, 1))); }, end:() => A.setRings(0)});
  K.check(B, 'The bank sends its payment files to the auditor as CSV files by e-mail. They are often produced by hand, weeks later.', 0, 2600);
  K.add({dur:1200, sim:0, cap:`The audit finds the duplicate record. It was paid ${perT}, and recovery starts months after the money left.`,
    start:() => { const sub = G.grp.children[2].children[1]; sub.textContent = 'LEAKED'; sub.setAttribute('fill', C.hold); },
    run:p => { G.setBadge(p, 'fail'); G.setFlash(.6*Math.sin(Math.PI*p)); A.setRings(Math.sin(Math.PI*p)*.8); }, end:() => A.setRings(0)});
  K.pulse(G, 'Recovery starts months later: a letter goes to the person who got the duplicate. Many rules need a further process to recover the money (varies by country).', 0);

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), R.docs(T), ['Paid to a duplicate record', T.m.leak ? perT : '—', !!T.m.leak]];
  T.extraSummary = () => [['Duplicate found', 'months later, at audit'], ['Record with a name mismatch', 'paid in a supplementary run']];
  T.doneText = `Done. The budget sat at the bank as a float, one person waited for an appeal, and ${perT} went to a duplicate that only the audit found.`;
}

/* ---- With AFC: one process in its own space; institutions outside it, reaching it only through the gateway ---- */
function g01Afc(T, K){
  const {org, from, n, useT, perT} = g01Vars(T);
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Source leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${from}`, 'Payout leg']
  ]);
  const I = space.inside, sig = space.sig();
  // The source leg sits a little right of centre with its label on the left, so the funds that rise from the treasury cross no text.
  g01Place(T, I.fromAnchor, 200, true);
  const [xT, xM, xB] = planeXs(3);
  const Tr = makeNode(T, {x:xT, y:INST_Y, label:'Treasury', sub:'State budget', lockAt:[70, -20]});
  const M = makeNode(T, {x:xM, y:INST_Y, label:org, sub:'Programme owner', lockAt:[70, -20]});
  const fM = g01MarkNode(T, M);
  const B = makeNode(T, {x:xB, y:INST_Y, label:'Bank / PSP', sub:`Distributor · ${useT}`, lockAt:[70, -20]});
  const fB = g01MarkNode(T, B);
  space.connect([Tr, M, B]);
  const funds = makeCoins(T.layers.tokens, from, 4, Tr.x, Tr.y + 16, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 4, I.chain.x, I.chain.y + 16, 0);
  const out = makeCoins(T.layers.tokens, from, 3, I.toAnchor.x, I.toAnchor.y + 16, 0);
  const inn = makeCoins(T.layers.tokens, from, 3, B.x, B.y + 16, 0);
  const notes = [M, Tr].map(() => makeEnvelope(T.layers.tokens, null, 'NOTICE'));

  // 1 of 5 · each institution checks its own data; the request reaches the gateway; AFC routes it to the source leg
  K.add({dur:1900, sim:.5, cap:'1 of 5 · Request. Each institution has checked its own data; two records are flagged for review. AFC receives the signed list and payment and routes them.',
    start:() => { T.m.flagged = 2; },
    run:p => {
      const a = Math.min(seg(p, 0, .12), 1 - seg(p, .26, .36));
      [Tr, M, B].forEach(x => x.setRings(a));
      Tr.setBadge(seg(p, .3, .42), 'ok');
      fM.set(seg(p, .4, .54)); fB.set(seg(p, .4, .54));
      if (p >= .55 && p < .8) { const q = seg(p, .55, .8); sig.set(M.x, lerp(M.y - M.r - 2, SPACE_GW, ease(q)), fade(q, .1, .9)); }
      if (p >= .8) { const q = seg(p, .8, 1); const [x, y] = quad(M.x, SPACE_GW, 330, 172, I.fromAnchor.x, I.fromAnchor.y + 26, ease(q)); sig.set(x, y, fade(q, .1, .9)); }
    }});
  // 2 of 5 · the source leg accepts the funds for the cleared payments on its reserve account
  K.add({dur:1300, sim:.25, cap:'2 of 5 · Accept. The treasury’s funds for the cleared payments only are accepted on the source anchor’s reserve. Flagged records are not funded.',
    run:p => {
      const [x, y] = quad(Tr.x, Tr.y + 16, 185, 210, I.fromAnchor.x, I.fromAnchor.y + 16, ease(seg(p, 0, .8)));
      funds.set(x, y, Math.min(seg(p, 0, .04), 1 - seg(p, .86, 1)));
      I.fromAnchor.setBadge(seg(p, .8, .92), 'ok'); I.fromAnchor.setFlash(.5*Math.sin(Math.PI*seg(p, .8, 1)));
    }});
  // 3 of 5 · after acceptance the proof is recorded in NodeChain and ArosCoin is issued 1 = 1
  K.add({dur:1500, sim:.25, cap:'3 of 5 · Issue. After acceptance, AFC instructs NodeChain. The proof of transaction is recorded, and ArosCoin is issued 1 = 1. No token existed before.',
    start:() => { T.m.pot++; },
    run:p => {
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y + 26, 330, 40, I.chain.x, I.chain.y + 26, ease(seg(p, 0, .7)));
      sig.set(x, y, fade(seg(p, 0, .7), .08, .7));
      aro.set(I.chain.x, I.chain.y + 16, seg(p, .6, 1));
    }});
  // 4 of 5 · the payout leg accepts ArosCoin; AFC checks its reserve against the same amount
  K.add({dur:1300, sim:.25, cap:`4 of 5 · Accept. The payout anchor accepts ArosCoin. AFC checks that its reserve covers the payout of the same amount in ${from}.`,
    run:p => {
      const [x, y] = quad(I.chain.x, I.chain.y + 16, 670, 56, I.toAnchor.x, I.toAnchor.y + 16, ease(seg(p, 0, .8)));
      aro.set(x, y, Math.min(seg(p, 0, .04), 1 - seg(p, .86, 1)));
      I.toAnchor.setBadge(seg(p, .8, .92), 'ok'); I.toAnchor.setFlash(.5*Math.sin(Math.PI*seg(p, .8, 1)));
    }});
  // 5 of 5 · the payout reaches the bank, which credits each cleared person on its own books; notices leave through the gateway
  K.add({dur:2000, sim:.5, cap:`5 of 5 · Output. The bank credits ${perT} to each of the ${n - 1} cleared ${n - 1 === 1 ? 'person' : 'people'} on its own books. Notices leave through the gateway. The process ends here.`,
    run:p => {
      out.set(I.toAnchor.x, I.toAnchor.y + 16, Math.min(seg(p, 0, .05), 1 - seg(p, .6, 1)));
      inn.set(B.x, B.y + 16, seg(p, .4, 1));
      B.setBadge(seg(p, .85, 1), 'ok');
      // notices leave from under the gateway bar, never over its label
      const q1 = seg(p, .15, .8), q2 = seg(p, .3, .95);
      notes[0].set(M.x, lerp(SPACE_GW + 26, M.y - 28, ease(q1)), fade(q1, .15, .8));
      notes[1].set(Tr.x, lerp(SPACE_GW + 26, Tr.y - 28, ease(q2)), fade(q2, .15, .8));
    }});

  T.rows = () => [R.holds(T), R.onHold(T), ['Proof of transaction', T.m.pot ? '1' : '0', false], ['Sent to review', String(T.m.flagged), false], ['Paid to a duplicate record', money(0, from), false]];
  T.extraSummary = () => [['Token before acceptance', '0'], ['Duplicate found', 'before payment, by a caseworker'], ['Record with a name mismatch', 'reviewed, then paid when cleared']];
  T.doneText = `Done. The treasury funded only the cleared payments, so no float waited at the bank. Two flagged records went to a caseworker, and nobody was refused. ${perT} reached each cleared person.`;
}

GOV.push({
  key:'gov-benefits', no:'G01', group:'Government',
  name:'Targeted benefits', sub:'Pre-funded float vs cleared payments',
  inputs:[{id:'org', label:'Your ministry', type:'text', def:'Ministry of Welfare'},
          {id:'from', label:'Currency', type:'currency', def:'USD'},
          {id:'amount', label:'Monthly budget', type:'amount', def:5000000},
          {id:'per', label:'Benefit per person', type:'amount', def:150, step:10},
          {id:'n', label:'Beneficiaries shown', type:'number', def:4, min:2, max:6, hint:'Between 2 and 6'},
          {id:'use', label:'Permitted use', type:'select', options:['Food', 'Utilities', 'School costs'], def:'Food'}],
  lede:'A monthly support payment to eligible people. Today the budget is pre-funded to a bank, the list travels as a file, and a duplicate is paid and found only at audit. With AFC the treasury funds only the cleared payments, and flagged records go to a caseworker.',
  note:'Illustrative model. Timings, amounts and the duplicate case are examples, not service levels or measurements; time spent in caseworker review and appeals is outside the With AFC clock. Eligibility is decided by the ministry on its own registry: AFC does not assess, score or refuse anyone. A flagged record goes to a caseworker, and nobody is refused automatically; the person keeps the right to appeal. Pre-funding is one pattern; programmes differ by country. The With AFC track does not perform the caseworker review, the appeal, the bank’s name matching or the shop’s permitted-use check: each institution keeps those on its own data. AFC is a logical process layer: it holds no funds, issues no money and is not a party to settlement. The treasury, the anchors and the bank keep the money on their own books. The protocol (PoT) fee has no amount until its tariff is set. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Pre-funded float and paper lists', vbH:470, unit:'h', build:g01Today},
  next:{tag:'With AFC', title:'Only cleared payments are funded', vbH:420, unit:'h', build:g01Afc}
});
