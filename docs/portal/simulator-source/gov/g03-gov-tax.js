/* ================= G03 · Taxes and refunds ================= */
// Today: return, assessment, post, bank batch, treasury suspense, a receipts list, reconciliation by hand, query, paper refund.
// With AFC: the bank's confirmed payment and the authority's ID reach AFC through the gateway; the payer's anchor accepts the funds;
// the treasury books the payment; the refund decision is checked and recorded, and the treasury pays it on its own books.
function g03Vars(T){
  const v = T.cfg.v, {from, amount} = T.cfg;
  const pct = Math.max(0, Math.min(30, Math.round(Number(v.refund ?? 12))));
  const rf = Math.round(amount*pct/100);
  return {org:v.org || 'Revenue Authority', co:v.company || 'Atlas Trading Ltd', from, amount, pct, rf, amt:g03Lock(amount, from, 14), rfT:g03Lock(rf, from, 14), id:'A-48213'};
}
function g03Lock(v, cur, max = 12){ const f = money(v, cur); if (f.length <= max) return f; try { return new Intl.NumberFormat('en',{style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); } catch { return f; } }
// After a step is added, run extra code on every frame of that step.
function g03After(T, fn){ const st = T.steps[T.steps.length - 1], r0 = st.run; st.run = p => { r0 && r0(p); fn(p); }; }
// One With-AFC step is one animation call. Its parts (checks, sparks, coins, notices) run back to back
// inside it, so the viewer's step counter matches the captions "n of N". The parts are built with the
// engine's own step kit on a separate list and then played in order inside the one step.
function g03Beat(T, K, cap, sim, fill){
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
// Round status dot: grey (idle), amber "?" (open question) or green tick (matched).
function g03Dot(parent, cx, cy){
  const g = svgEl('g',{transform:`translate(${cx},${cy})`}, parent);
  const c = svgEl('circle',{r:10, fill:'#EEF1F5', stroke:C.rail, 'stroke-width':1.2}, g);
  const q = svgEl('text',{x:0, y:.5, 'text-anchor':'middle', 'dominant-baseline':'central', 'font-size':13, 'font-weight':700, fill:'#FFFFFF', opacity:0}, g); q.textContent = '?';
  const k = svgEl('path',{d:'M-4.5,0 l3,3.2 l6,-6.4', fill:'none', stroke:'#FFFFFF', 'stroke-width':2, 'stroke-linecap':'round', 'stroke-linejoin':'round', opacity:0}, g);
  return {set(state){ c.setAttribute('fill', state === 'ok' ? C.ok : state === 'q' ? '#D98E04' : '#EEF1F5'); c.setAttribute('stroke', state === 'idle' ? C.rail : '#FFFFFF'); q.setAttribute('opacity', state === 'q' ? 1 : 0); k.setAttribute('opacity', state === 'ok' ? 1 : 0); }};
}
// The tax office's reconciliation desk: slips that clerks must match by hand (Today only).
function g03Ledger(T, x, y, w, rows){
  const L = T.layers.paths;
  const title = svgEl('text',{x, y:y + 8, 'font-size':11, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted, opacity:0}, L);
  title.textContent = 'RECONCILIATION DESK · BY HAND';
  return rows.map((r, i) => {
    const g = svgEl('g',{opacity:0, transform:`translate(${x},${y + 18 + i*42})`}, L);
    svgEl('rect',{x:0, y:0, width:w, height:36, rx:7, fill:'#FFFFFF', stroke:C.ink, 'stroke-width':1.2}, g);
    const a = svgEl('text',{x:12, y:14, 'font-size':10.5, 'letter-spacing':1.4, 'font-weight':600, fill:C.muted}, g); a.textContent = r[0];
    const b = svgEl('text',{x:12, y:29, 'font-size':14, fill:C.ink}, g); b.textContent = r[1];
    const dot = g03Dot(g, w - 22, 18);
    return {text(s){ b.textContent = s; }, label(s, flag){ a.textContent = s; a.setAttribute('fill', flag ? '#9A5B00' : C.muted); }, dot, show(p){ g.setAttribute('opacity', ease(p)); if (i === 0) title.setAttribute('opacity', ease(p)); }};
  });
}
// Queue of paper refund claims waiting at the tax office; the viewer's claim is last (Today only).
function g03Queue(T, x, y){
  const n = 6, g = svgEl('g',{opacity:0}, T.layers.paths);
  const t = svgEl('text',{x, y:y - 24, 'font-size':11, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, g); t.textContent = 'REFUND CLAIMS IN REVIEW';
  const papers = Array.from({length:n}, (_, i) => {
    const pg = svgEl('g', null, g), ours = i === n - 1;
    svgEl('rect',{x:-11, y:-15, width:22, height:30, rx:3, fill:ours ? '#EAF1FD' : '#FFFFFF', stroke:ours ? C.blue : C.ink, 'stroke-width':ours ? 2 : 1.2}, pg);
    svgEl('path',{d:'M-6,-7 h12 M-6,-1 h12 M-6,5 h8', stroke:ours ? C.blue : '#9AA1AC', 'stroke-width':1.5}, pg);
    return pg;
  });
  const place = shift => papers.forEach((pg, i) => { const s = i - shift; pg.setAttribute('transform', `translate(${x + 14 + Math.max(s, -.4)*34},${y})`); pg.setAttribute('opacity', clamp(s + 1)); });
  place(0);
  return {show(p){ g.setAttribute('opacity', ease(p)); }, advance(p){ place((n - 1)*ease(p)); }};
}

/* ---------- Today: the real path, with every hand-off, check, hold and wait ---------- */
function g03Today(T, K){
  const {org, co, from, amount, pct, rf, amt, rfT, id} = g03Vars(T), refund = pct > 0, lockT = g03Lock(amount, from);
  const D = (l, sealed) => makeDoc(T.layers.tokens, l, sealed);
  const P = makeNode(T, {x:120, y:192, r:48, label:co, sub:'Taxpayer'});
  const TA = makeNode(T, {x:500, y:192, r:48, label:org, sub:'Assessment · refunds'});
  const Tr = makeNode(T, {x:880, y:192, r:48, label:'State treasury', sub:'Receives tax', hidden:true});
  const Bk = makeNode(T, {x:500, y:358, r:42, label:'Taxpayer’s bank', sub:'Pays on order', hidden:true, lockAt:[60, 6]});
  const coins = makeCoins(T.layers.tokens, from, 4, Bk.x, Bk.y + 16, 0);
  const rcoins = makeCoins(T.layers.tokens, from, 3, Tr.x, Tr.y + 16, 0);
  const led = g03Ledger(T, 40, 322, 350, [['ASSESSMENT', `${id} · ${lockT}`], ['TREASURY RECEIPT', `ref “A-4813” · ${lockT}`], ['PAYMENT SLIP FROM TAXPAYER', `ref “${id}” · ${lockT}`]]);
  const queue = refund ? g03Queue(T, 700, 424) : null;
  T.m.g03m = 0;

  // 1 · the company prepares the return and files it
  K.pulse(P, `${co} must settle ${amt} in tax for the period. Its own team closes the books and prepares the return first.`);
  K.check(P, 'The finance team collects invoices, payroll and bank data, often with an outside accountant. Illustrative: about a week.', 120, 3000);
  K.travel(P, TA, D('RETURN'), `${co} files the return with ${org}, online or on paper, depending on the country and the company.`, 24, {count:'docs'});
  K.check(TA, `${org}’s intake team logs the return. Figures are keyed into the case system; paper attachments are scanned or retyped.`, 48, 2600);
  K.check(TA, 'Figures are matched against third-party reports from banks and employers. Mismatches go to an officer. The rules vary by country.', 24, 2600);
  K.check(TA, `An officer reviews the flagged items and works out the tax due: ${amt}. Review time is illustrative: days or weeks.`, 120, 3000);
  K.stamp(TA, ['Return checked', 'Tax assessed'], `${org} issues the assessment under ID ${id}. The decision stays with the authority and can be appealed within the period set by law.`, 4, 'Assessment');
  g03After(T, p => led[0].show(seg(p, .3, 1)));

  // 2 · the notice goes by post; the reference is copied by hand
  K.travel(TA, P, D('ASSESSMENT'), 'The assessment notice goes out by post, with a payment reference printed in the letter. Illustrative: several days in the post.', 96, {count:'docs'});
  K.check(P, `${co}’s tax team reads the notice and checks the amount against its own calculation.`, 24, 2600);
  K.pulse(P, 'The reference is copied by hand into the bank’s free-text field. One typo later leaves the payment unallocated.', 2);

  // 3 · the company orders the payment; the bank reserves the funds until its batch
  K.travel(P, Bk, D('PAYMENT ORDER'), `${co} orders its bank to pay ${amt} by internet banking. The assessment number is typed into a free-text field.`, 6, {count:'docs'});
  K.check(Bk, 'The bank screens the payer and the payment under its own AML and sanctions rules. Minutes to hours.', 3, 2600);
  K.hold(Bk, lockT, `The bank reserves ${amt} on the company’s account until its next payment batch. This is a real hold of funds.`, 3);
  K.check(P, 'The company’s statement shows the amount as reserved, so the payment looks made. Nothing has reached the treasury yet.', 12, 2400);
  K.check(Bk, 'The bank’s operations team applies its cut-off time. A payment after cut-off waits for the next batch.', 6, 2400);
  K.add({dur:1800, sim:12, cap:'The bank sends the payment in its next batch to the national payment system. The reference is free text, so no assessment ID travels with it.', start:() => { T.m.msgs++; }, run:p => {
    Bk.releaseLock(seg(p, 0, .3));
    const [x, y] = quad(Bk.x, Bk.y + 16, 760, 300, Tr.x, Tr.y + 16, ease(seg(p, .25, .95)));
    coins.set(x, y, seg(p, 0, .08)); Tr.setPresence(Math.max(Tr.presence, seg(p, .6, 1)));
  }, end:() => T.holdOff()});
  K.hold(Tr, lockT, 'The treasury cannot tell which assessment the money belongs to. It parks the amount in a suspense account, unallocated. This is a real hold of funds.', 4);

  // 4 · the treasury reports its receipts to the authority as a list
  K.check(Tr, `The treasury’s cash office books the receipt, unallocated, and prepares a receipts list for ${org}.`, 24, 2600);
  K.travel(Tr, TA, D('STATEMENT'), `The treasury sends its receipts list to ${org}, days later, as a file. The file has an amount and a free-text reference only.`, 72, {count:'docs'});
  g03After(T, p => led[1].show(seg(p, .5, 1)));
  K.check(TA, 'One line fails the import because of a stray character. A clerk retypes it by hand, which takes another day.', 24, 2600);

  // 5 · reconciliation by hand; the typed reference matches nothing and is flagged
  K.add({dur:3000, sim:72, cap:`Clerks at ${org} match each receipt to an assessment by hand: reference, amount and taxpayer name. Illustrative: several days.`, run:p => {
    const a = Math.min(seg(p, 0, .12), 1 - seg(p, .88, 1)); TA.setRings(a);
    if (p > .85) { led[0].dot.set('q'); led[1].dot.set('q'); }
  }, end:() => TA.setRings(0)});
  K.add({dur:800, sim:8, cap:'The reference “A-4813” matches no open assessment: one digit is missing. The clerk does not guess. The case is flagged for review.', run:p => {
    TA.setFlash(.5*Math.sin(Math.PI*p)); if (p > .3) led[1].label('RECEIPT · FLAGGED FOR REVIEW', true);
  }, end:() => { T.m.flagged = 1; }});

  // 6 · the query, the phone call, the second payment slip
  K.travel(TA, P, D('QUERY'), `${org} writes to ${co} and asks for the payment slip. The letter goes by post.`, 24, {count:'docs', burn:false, bend:130});
  K.travel(P, TA, makeEnvelope(T.layers.tokens, null, 'CALL'), `${co} phones the helpline. It sees the bank’s payment date, not the treasury’s receipt, so it cannot close the case.`, 4, {count:'msgs', burn:false});
  K.travel(P, Bk, D('SLIP REQUEST'), `${co} asks its bank for a copy of the payment slip. Some banks need a signed request form.`, 24, {count:'docs'});
  K.check(Bk, 'The bank looks up the transfer in its own system and prints a payment slip. Illustrative: one to two business days.', 36, 2600);
  K.travel(Bk, P, D('PAYMENT SLIP'), 'The slip is handed over at the branch or posted to the company.', 24, {count:'docs', burn:false});
  K.travel(P, TA, D('PAYMENT SLIP'), `${co} copies the slip and posts it to ${org}. The slip carries the assessment ID, which the receipt does not.`, 72, {count:'docs', burn:false, bend:-130});
  g03After(T, p => led[2].show(seg(p, .5, 1)));

  // 7 · the match, the allocation, the portal
  K.add({dur:2600, sim:96, cap:`With the slip in hand the clerk matches all three. The treasury allocates the money and ${co}’s account shows “paid”. Illustrative: about four days.`, run:p => {
    const a = Math.min(seg(p, 0, .12), 1 - seg(p, .88, 1)); TA.setRings(a);
    Tr.releaseLock(seg(p, .5, .9));
    if (p > .5) { led[1].text(`ref “${id}” (corrected) · ${lockT}`); led[1].label('TREASURY RECEIPT', false); led[0].dot.set('ok'); led[1].dot.set('ok'); led[2].dot.set('ok'); }
    TA.setBadge(seg(p, .6, 1), 'ok');
  }, end:() => { TA.setRings(0); T.holdOff(); T.m.g03m = 1; }});
  K.check(TA, `${org}’s portal shows the assessment as paid the next day, after its nightly update.`, 24, 2400);

  // 8 · the paper refund claim, the queue, the officer, the treasury's own payment run
  if (refund) {
    K.pulse(P, `Later, ${co} claims a refund of ${rfT} (${pct}% of the tax) on a paper form, with copies of the slip and the assessment. Illustrative: a month or more.`, 720);
    K.travel(P, TA, D('REFUND CLAIM'), 'The paper claim is posted to the authority and logged. It joins a queue with other claims.', 24, {count:'docs'});
    g03After(T, p => queue.show(p));
    K.check(TA, 'The claim waits in the queue. An officer later searches the archive for the payment evidence. Illustrative: weeks.', 480, 3400);
    g03After(T, p => queue.advance(p));
    K.travel(TA, P, D('LETTER'), `The officer asks ${co} to confirm its bank account for the refund, by post.`, 72, {count:'docs'});
    K.travel(P, TA, D('ACCOUNT FORM'), 'The company posts back the signed account form. Its details are checked against the bank records by hand.', 120, {count:'docs'});
    K.check(TA, 'The officer pulls the file, finds the payment evidence and checks it against the claim and the assessment.', 48, 3000);
    K.travel(TA, Tr, D('REFUND ORDER', true), `The officer signs the refund decision. A paper refund order goes to the treasury. ${co} can still appeal the decision.`, 48, {count:'docs'});
    K.check(Tr, 'The treasury checks the order against its budget limits and queues it for the next payment run.', 96, 2600);
    K.coins(rcoins, Tr, Bk, 'The treasury pays the refund to the company’s bank in its next payment run.', 24, {bend:28});
    K.coins(rcoins, Bk, P, `The bank credits ${co} with ${rfT}. The refund arrives long after the payment.`, 12, {bend:-28, arrive:() => P.setBadge(1, 'ok')});
    g03After(T, p => queue.show(1 - seg(p, .3, 1)));
  }

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), R.docs(T), ['Payments matched by hand', T.m.g03m ? '1 of 1, after queries' : (T.m.flagged ? 'flagged' : '—'), !!T.m.flagged && !T.m.g03m]];
  T.extraSummary = () => [['Reconciliation', 'by hand, after days'], ['Refund path', refund ? 'paper claim, queue, second run' : 'no refund claimed']];
  T.doneText = refund ? `Done after months (illustrative). The payment was matched by hand after queries, and the refund of ${rfT} needed a paper claim, a queue and a second payment run.` : 'Done. The payment was matched by hand days after it was made, after letters between the taxpayer, the tax office and the treasury.';
}

/* ---------- With AFC: one process space; institutions outside, reaching it only through the gateway ---------- */
function g03Afc(T, K){
  const {org, co, from, amount, pct, amt, rfT, id} = g03Vars(T), refund = pct > 0, N = refund ? 5 : 3;
  // Inside the frame: the payer's anchor, NodeChain (AST) and the treasury's anchor. The routing component is not drawn; it is named in captions only.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Payer leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${from}`, 'Treasury leg']
  ]);
  const I = space.inside;
  // Outside the frame: institutions only. None is linked to an internal part or to another institution.
  const [xBk, xP, xTA, xTr] = planeXs(4);
  const Bk = makeNode(T, {x:xBk, y:INST_Y, r:50, label:'Taxpayer’s bank', sub:'Pays · own books', lockAt:[70, -20]});
  const P = makeNode(T, {x:xP, y:INST_Y, r:50, label:co, sub:'Taxpayer', lockAt:[70, -20]});
  const TA = makeNode(T, {x:xTA, y:INST_Y, r:50, label:org, sub:'Assessment · refunds', lockAt:[70, -20]});
  const Tr = makeNode(T, {x:xTr, y:INST_Y, r:50, label:'State treasury', sub:'Receives · pays', lockAt:[70, -20]});
  space.connect([Bk, P, TA, Tr]);
  const funds = makeCoins(T.layers.tokens, from, 4, Bk.x, Bk.y + 16, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 4, I.chain.x, I.chain.y + 16, 0);
  const spark = space.sig(), conf = [Bk, TA, Tr].map(() => space.sig());
  const ft = floatText(T.layers.fx, I.chain.x, I.chain.y - 40, '1 = 1', C.afc);

  // 1 of N · the one pass: each institution confirms on its own records; the request reaches the routing component through the gateway
  g03Beat(T, K, `1 of ${N} · Request. Bank, treasury and authority each confirm ID ${id} on their own records. AFC gets the payment through the gateway and routes it to the payer’s leg.`, 1, k => {
    k.add({dur:2600, start:() => { T.m.api += 3; }, run:p => {
      const a = Math.min(seg(p, 0, .15), 1 - seg(p, .85, 1));
      [Bk, TA, Tr].forEach((n, i) => { n.setRings(a); conf[i].set(n.x, lerp(n.y - n.r, SPACE_GW, ease(seg(p, .1, .7))), fade(p, .05, .8)); });
      space.scan(p, a); space.glow(p > .7);
    }, end:() => { [Bk, TA, Tr].forEach(n => n.setRings(0)); space.glow(false); }});
    k.badge([[Bk, 'ok'], [TA, 'ok'], [Tr, 'ok']], '', 0);
  });

  // 2 of N · the payer's anchor accepts the funds on its reserve; only then PoT and ArosCoin 1 = 1
  g03Beat(T, K, `2 of ${N} · Accept and issue. The payer’s ${from} anchor accepts the funds on its reserve. Only then NodeChain records the proof and AST issues ArosCoin 1 = 1.`, .5, k => {
    k.coins(funds, Bk, I.fromAnchor, '', 0, {fadeOut:true});
    k.badge([[I.fromAnchor, 'ok']], '', 0);
    k.add({dur:1000, start:() => { T.m.pot++; }, run:p => { spark.set(lerp(I.fromAnchor.x, I.chain.x, ease(p)), I.chain.y, fade(p, .05, .9)); }});
    k.add({dur:1000, run:p => { aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)); ft.set(p); }});
    k.badge([[I.chain, 'ok']], '', 0);
  });

  // 3 of N · the treasury's anchor accepts ArosCoin and pays out; the treasury books it on its own books
  const last = refund ? '' : ` ${co} is notified through the gateway.`;
  g03Beat(T, K, refund
    ? `3 of ${N} · Output. The treasury’s anchor accepts ArosCoin and pays out ${from} from its reserve, with no conversion. The treasury books it on its own books.`
    : `3 of ${N} · Output. The treasury’s anchor accepts ArosCoin and pays out ${from}, with no conversion. The treasury books it.${last}`, 1, k => {
    k.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true});
    k.badge([[I.toAnchor, 'ok']], '', 0);
    settleStep(T, k, I.toAnchor, Tr, from, from, '', 0, 1200);
    k.badge([[Tr, 'ok'], [TA, 'ok']], '', 0);
    if (!refund) notify(T, k, space, P, '', 0);
  });

  if (refund) {
    // 4 of 5 · the claim arrives through the gateway; the authority signs; AFC checks the signature and records it
    g03Beat(T, K, `4 of 5 · Decision. ${co} claims ${rfT} on ID ${id}. ${org} signs the decision. AFC checks the signature and records it on the trail. It decides nothing.`, 72, k => {
      k.api(P, space, '', 0);
      k.check(TA, '', 0, 2400);
      k.api(TA, space, '', 0);
      k.add({dur:900, run:p => { space.scan(p, .6*Math.sin(Math.PI*p)); }});
      k.add({dur:1100, start:() => { T.m.pot++; }, run:p => { spark.set(I.chain.x, lerp(SPACE_GW, I.chain.y, ease(seg(p, 0, .8))), fade(p, .05, .85)); }});
      k.badge([[I.chain, 'ok']], '', 0);
      k.add({dur:1, run:() => { T.m.g03dec = 1; }});
    });

    // 5 of 5 · the treasury pays on its own books; the bank credits the company; the company is notified through the gateway
    g03Beat(T, K, `5 of 5 · Payout. The treasury pays ${rfT} on its own books and the bank credits ${co}. ${co} is notified through the gateway. The process ends.`, 24, k => {
      settleStep(T, k, Tr, Bk, from, from, '', 0, 1400);
      k.badge([[Bk, 'ok']], '', 0);
      notify(T, k, space, P, '', 0);
      k.badge([[P, 'ok']], '', 0);
    });
  }

  T.rows = () => [R.holds(T), R.api(T), ['Paper documents', String(T.m.docs), false], ['Matched by hand', '0', false], ['Refund decision', refund ? (T.m.g03dec ? 'signed and recorded' : 'pending') : 'not claimed', false]];
  T.extraSummary = () => [['Reconciliation', 'none: one ID on every step'], ['Refund path', refund ? 'same ID, paid on own books' : 'no refund claimed']];
  T.doneText = refund
    ? `Done in days, mostly the authority’s own review (illustrative). The payment and the ${rfT} refund sit on one trail under ID ${id}. Nothing was matched by hand.`
    : `Done. The payment was accepted on the payer’s anchor reserve, recorded, and booked by the treasury under ID ${id}. Nothing was matched by hand.`;
}

GOV.push({
  key:'gov-tax', no:'G03', group:'Government',
  name:'Taxes and refunds', sub:'Matched by hand vs one ID trail',
  inputs:[ {id:'org', label:'Your tax authority', type:'text', def:'Revenue Authority'},
           {id:'company', label:'Taxpayer company', type:'text', def:'Atlas Trading Ltd'},
           {id:'from', label:'Currency', type:'currency', def:'EUR'},
           {id:'amount', label:'Tax amount', type:'amount', def:1200000},
           {id:'refund', label:'Refund claim (% of tax)', type:'number', def:12, min:0, max:30} ],
  lede:'A company pays a tax assessment and later claims a refund. Today the bank, the treasury and the tax office pass the payment on by post, files and a free-text reference, and clerks match it by hand. With AFC, one assessment ID links the payment, the treasury receipt and the refund decision.',
  note:'Illustrative model. Timings, queue lengths and waiting times are examples, not service levels, and they vary by country and by authority. Assessments, refund decisions, inspections and appeals belong to the tax authority: AFC does not assess tax, approve or deny a claim, and the taxpayer’s right to object or appeal is unchanged. Each institution checks its own records and shows its own result. AFC holds no funds: the payer’s anchor accepts the funds on its reserve account, ArosCoin is issued 1 = 1 only after that acceptance, and the treasury and the bank settle on their own books. The With-AFC track does not remove the authority’s review time, does not publish tax data (access to the trail follows each party’s own legal and confidentiality rules), and does not claim atomic settlement across the tax, bank and treasury systems. Holds are drawn only where they are real, on the Today track. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Post, files, desk and paper claims', vbH:470, unit:'h', build:g03Today},
  next:{tag:'With AFC', title:'One ID, one process space', vbH:420, unit:'h', build:g03Afc}
});
