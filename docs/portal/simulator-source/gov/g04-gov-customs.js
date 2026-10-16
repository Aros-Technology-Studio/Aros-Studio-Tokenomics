/* ================= G04 · Customs ================= */
// Today: the importer files a declaration, customs assesses the duty, the bank pays it without the declaration number, and the proof travels back on paper. The goods wait in the yard.
// With AFC: the bank and customs each confirm on their own books, linked by the declaration ID; the bank sees the reference and the duty only; customs decides release.
function g04Vars(T){
  const v = T.cfg.v, {from, amount} = T.cfg;
  const rate = Math.max(1, Math.min(40, Number(v.rate) || 12));
  const duty = Math.round(amount*rate/100);
  return {org:v.org || 'Port Customs Office', imp:v.importer || 'Meridian Imports Ltd', from, amount, rate, duty,
    valT:g04Short(amount, from, 14), dutyT:g04Short(duty, from, 14), dutyS:g04Short(duty, from, 12), did:'D-77204'};
}
function g04Short(v, cur, max = 12){ const f = money(v, cur); if (f.length <= max) return f; try { return new Intl.NumberFormat('en',{style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); } catch { return f; } }
function g04After(T, fn){ const st = T.steps[T.steps.length - 1], r0 = st.run; st.run = p => { r0 && r0(p); fn(p); }; }
// Relabel the shared summary rows: here the thing on hold is the goods, not funds.
function g04Summary(T){
  const base = Object.getPrototypeOf(T).summary;
  T.summary = () => base.call(T).map(r => r[0] === 'Peak amount on hold' ? ['Peak value of goods held', r[1]] : r[0] === 'Time with funds on hold' ? ['Time goods held at the border', r[1]] : r);
}
// Dashed holding area where customs keeps the goods.
function g04Yard(T, x, y, w, h, label){
  const L = T.layers.paths;
  svgEl('rect',{x, y, width:w, height:h, rx:14, fill:'#F6F8FA', stroke:C.muted, 'stroke-width':1.1, 'stroke-dasharray':'6 6'}, L);
  const t = svgEl('text',{x:x + 14, y:y + 21, 'font-size':11, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, L); t.textContent = label;
}
// One line of customs' own bank statement: a payment it cannot yet tie to a declaration.
function g04Statement(T, x, y, w){
  const g = svgEl('g',{opacity:0}, T.layers.paths);
  const t = svgEl('text',{x, y:y - 8, 'font-size':11, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, g); t.textContent = 'CUSTOMS’ BANK STATEMENT';
  svgEl('rect',{x, y, width:w, height:40, rx:8, fill:'#FFFFFF', stroke:C.ink, 'stroke-width':1.2}, g);
  const a = svgEl('text',{x:x + 12, y:y + 16, 'font-size':10.5, 'letter-spacing':1.4, 'font-weight':600, fill:C.muted}, g); a.textContent = 'INCOMING PAYMENT';
  const b = svgEl('text',{x:x + 12, y:y + 32, 'font-size':14, fill:C.ink}, g);
  const dot = svgEl('g',{transform:`translate(${x + w - 22},${y + 20})`}, g);
  const c = svgEl('circle',{r:10, fill:'#D98E04', stroke:'#FFFFFF', 'stroke-width':1.2}, dot);
  const q = svgEl('text',{x:0, y:.5, 'text-anchor':'middle', 'dominant-baseline':'central', 'font-size':13, 'font-weight':700, fill:'#FFFFFF'}, dot); q.textContent = '?';
  const k = svgEl('path',{d:'M-4.5,0 l3,3.2 l6,-6.4', fill:'none', stroke:'#FFFFFF', 'stroke-width':2, 'stroke-linecap':'round', 'stroke-linejoin':'round', opacity:0}, dot);
  return {show(p){ g.setAttribute('opacity', ease(p)); }, text(s){ b.textContent = s; }, ok(){ c.setAttribute('fill', C.ok); q.setAttribute('opacity', 0); k.setAttribute('opacity', 1); }};
}

/* ---- Today: the real path, with the hold that is real and the waits that are not ---- */
function g04Today(T, K){
  const {org, imp, from, amount, rate, valT, dutyT, dutyS, did} = g04Vars(T);
  const D = (l, sealed) => makeDoc(T.layers.tokens, l, sealed);
  const Im = makeNode(T, {x:120, y:300, r:48, label:imp, sub:'Importer'});
  const Cu = makeNode(T, {x:480, y:190, r:54, label:org, sub:'Duty & clearance', lockAt:[70, 20]});
  const Bk = makeNode(T, {x:850, y:110, r:48, label:'Importer’s bank', sub:'Pays the duty', hidden:true});
  g04Yard(T, 300, 326, 340, 96, 'HOLDING AREA · GOODS DETAINED');
  rail(T, Im, Cu, .2, true);
  const box = makeBox(T.layers.tokens);
  const coins = makeCoins(T.layers.tokens, from, 3, Bk.x, Bk.y + 16, 0);
  const stmt = g04Statement(T, 690, 350, 270);
  stmt.text(`${dutyS} · reference unreadable`);
  T.holdAmount = amount; T.m.g04seen = 0;

  // 1 · the shipment arrives; customs holds the goods; the importer files the declaration
  K.add({dur:2200, sim:0, cap:`A shipment for ${imp} reaches ${org}. It cannot leave the yard until the declaration is filed, the duty is paid and customs releases it.`,
    run:p => { box.set(470, 378, seg(p, 0, .15)); }});
  K.hold(Cu, 'goods held', `${org} keeps the goods in its yard. This hold is real: the goods cannot move until customs releases them.`, .5);
  K.pulse(Im, `${imp}’s broker calls customs to ask when the goods can be inspected. The call is noted in a diary, not in a system.`, 2);
  K.travel(Im, Cu, D('DECLARATION'), `${imp} or its customs broker files the declaration: goods, origin, tariff code and value ${valT}. Scanned invoice and bill of lading are attached.`, 6, {count:'docs', bend:30});

  // 2 · customs checks the file; an incomplete file goes back by e-mail
  K.check(Cu, `${org} checks the declaration for completeness: fields, codes and attachments. Some of these checks are still made by hand.`, 4);
  K.travel(Cu, Im, D('RETURNED'), 'The invoice page is missing. Customs returns the declaration by e-mail. Nothing moves until the file is corrected.', 8, {count:'msgs', bend:-30});
  K.pulse(Im, 'The broker reads the reason in the e-mail and types a new file. The correction is keyed in by hand, not copied from the old file.', 4);
  K.travel(Im, Cu, D('RE-FILED'), `${imp} re-files the declaration with the missing page. In this example the correction takes a day (illustrative).`, 24, {count:'docs', burn:false, bend:-30});

  // 3 · customs assesses the duty and the risk system decides on inspection
  K.check(Cu, `${org} accepts the file and looks up the tariff code. Duty = ${rate}% of ${valT} = ${dutyT}. The rate is an example.`, 6);
  K.check(Cu, 'The risk system selects the shipment for physical inspection or lets it through. The selection rules are customs’ own.', 2);
  K.travel(Cu, Im, D('DUTY NOTICE'), `A duty notice with a payment reference goes to ${imp}, by post or at the counter. It can take a working day or more (illustrative).`, 24, {count:'docs', burn:false, bend:30});

  // 4 · the importer pays at its bank; the bank screens and queues the payment
  K.travel(Im, Bk, D('PAYMENT ORDER'), `${imp} takes the notice to its bank and orders ${dutyT}. The declaration number is typed into the reference field by hand.`, 24, {count:'docs', bend:-200});
  K.check(Bk, 'The bank screens the payer and the payment under its own rules: sanctions, AML checks and the account balance.', 2);
  K.check(Bk, 'The bank checks its payment cut-off time. A payment received after the cut-off waits for the next payment run.', 4);
  K.badge([[Bk, 'ok']], `The bank debits ${imp} and queues the payment. This is not a hold: customs has received nothing yet.`, 2);
  K.pulse(Im, 'The importer sees the debit on its bank statement. The statement shows an amount and a date, not which declaration it paid.', 2);
  K.check(Bk, 'The payment waits in a batch for the central bank settlement window. The windows are set by the central bank and vary by country.', 6);

  // 5 · the money reaches customs without the declaration number
  K.coins(coins, Bk, Cu, `The payment run sends ${dutyT} to customs’ account. It is an unmatched payment, not a hold: customs cannot tie it to ${did} yet.`, 12, {bend:-60});
  g04After(T, p => stmt.show(seg(p, .6, 1)));
  K.pulse(Cu, 'Overnight the treasury sends customs an end-of-day statement file. An officer prints it the next morning. The payment is listed with no declaration number.', 16);

  // 6 · the paper proof travels back to customs
  K.travel(Bk, Im, D('PAYMENT PROOF', true), `The bank gives ${imp} a stamped paper proof of payment at its branch. The proof is paper; no system sees it.`, 8, {count:'docs', burn:false, bend:-200});
  K.travel(Im, Cu, D('PAYMENT PROOF', true), `${imp} brings the paper proof to the customs office. The goods have been in the yard since they arrived.`, 24, {count:'docs', burn:false, bend:30});
  K.check(Cu, 'An officer searches the open declarations for the same amount. Two files are close, and the paper proof alone does not settle the match.', 6);

  // 7 · the match is still open: letters go to the importer and to the bank
  K.travel(Cu, Im, D('REFERENCE?'), `Customs writes to ${imp} by post and asks for the bank’s reference. The letter takes a few days to arrive.`, 24, {count:'docs', burn:false, bend:-40});
  K.travel(Im, Cu, D('COPY'), `${imp} posts a photocopy of its bank receipt. The copy also takes days to arrive (illustrative).`, 24, {count:'docs', burn:false, bend:40});
  K.travel(Cu, Bk, D('QUERY'), 'The copy is not enough, so the officer asks the bank to confirm the payment in writing.', 12, {count:'docs', burn:false});
  K.travel(Bk, Cu, D('CONFIRMATION'), 'The bank confirms the payment by letter. This takes one or two working days (illustrative).', 48, {count:'docs', burn:false, bend:60});
  K.add({dur:900, sim:4, cap:'The officer types the declaration number against the payment by hand. The statement line now reads matched.',
    end:() => { T.m.g04seen = 1; stmt.text(`${dutyS} · matched to ${did}`); stmt.ok(); }});
  K.travel(Cu, Im, D('RECEIPT'), 'Customs posts a paper receipt for the duty. It is the only written record the importer gets.', 2, {count:'docs', burn:false, bend:-30});

  // 8 · the inspection, the senior sign-off and the release order: customs' own decisions
  K.check(Cu, 'Where the risk system selected the shipment, officers inspect it physically. The inspection takes the same time on both routes (illustrative: two days).', 48, 3000);
  K.check(Cu, 'Where the procedure requires it, a senior officer checks the paper file and co-signs it. Files move between desks.', 6);
  K.stamp(Cu, ['Duty paid', 'Release order signed'], 'Customs signs the release order itself. This decision stays with customs.', 2, 'Release order');
  K.release(Cu, 'The hold ends. The goods can leave once the importer holds the release order.', 1);
  K.travel(Cu, Im, D('RELEASE ORDER', true), `The release order goes to ${imp} on paper. Storage charges build up in the yard for every day of the wait (illustrative).`, 4, {count:'docs', burn:false, bend:60});

  // 9 · the goods leave; the month-end reconciliation is outside this clock
  K.add({dur:1900, sim:6, cap:'The goods leave the yard. The wait covered the notice, the bank, the paper proof and the bank’s letter.', run:p => {
    const [x, y] = quad(470, 378, 300, 440, Im.x, Im.y + 14, ease(p)); box.set(x, y, 1 - seg(p, .8, 1));
  }});
  K.check(Cu, 'Outside this clock: at month end customs and the treasury reconcile their accounts. Some payments are still matched by hand weeks later (illustrative).', 0, 2600);

  T.rows = () => [['Goods held at the border', T.m.holds > 0 ? money(T.holdAmount*T.m.holds, from) : '—', T.m.holds > 0], ['Time goods held', T.m.holdTime > 0 ? fmtDur(T.m.holdTime, T.unit) : '—', false], R.docs(T), ['Payment proof', 'paper, stamped', false], ['Customs sees the payment', T.m.g04seen ? 'after the bank letter' : 'not yet', !T.m.g04seen && T.m.holds > 0]];
  T.extraSummary = () => [['Payment proof', 'paper, carried back'], ['Customs sees the payment', 'after the bank letter']];
  g04Summary(T);
  T.doneText = `Released. The goods waited in the yard for the notice, the bank, the paper proof and the bank’s letter. Duty ${dutyT}; the inspection time was the same as with AFC.`;
}

/* ---- With AFC: one process in its own space; institutions outside it, reaching it only through the gateway ---- */
function g04Afc(T, K){
  const {org, imp, from, dutyT, did} = g04Vars(T);
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Source leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${from}`, 'Payout leg']
  ]);
  const I = space.inside;
  // Institutions sit under the frame. None is linked to another or to an internal component; the bank sits left of the gateway label.
  const Im = makeNode(T, {x:170, y:INST_Y, label:imp, sub:'Importer', lockAt:[70, -20]});
  const Bk = makeNode(T, {x:400, y:INST_Y, label:'Importer’s bank', sub:'Pays the duty', lockAt:[70, -20]});
  const Cu = makeNode(T, {x:830, y:INST_Y, label:org, sub:'Duty & clearance', lockAt:[70, -20]});
  space.connect([Im, Bk, Cu]);
  const funds = makeCoins(T.layers.tokens, from, 3, Bk.x, Bk.y + 16, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 3, I.chain.x, I.chain.y + 16, 0);
  const paid = makeCoins(T.layers.tokens, from, 3, I.toAnchor.x, I.toAnchor.y + 16, 0);
  const inCu = makeCoins(T.layers.tokens, from, 3, Cu.x, Cu.y + 16, 0);
  const spark1 = space.sig(), spark2 = space.sig(), spark3 = space.sig();
  const notes = [Bk, Im].map(() => makeEnvelope(T.layers.tokens, null, 'NOTICE'));

  // 1 of 5 · the request reaches the gateway; the bank and customs have each confirmed on their own books
  K.add({dur:1900, sim:.5, cap:`1 of 5 · Request. The bank confirms the ${dutyT} payment under ${did}. Customs confirms the duty on its records. AFC routes the request.`,
    start:() => { T.m.api += 2; T.m.sh = 1; },
    run:p => {
      const a = Math.min(seg(p, 0, .12), 1 - seg(p, .3, .4));
      Bk.setRings(a); Cu.setRings(a);
      Im.bump = 1 + .07*Math.sin(p*Math.PI*3)*(1 - p);
      const q = seg(p, .15, .55);
      spark1.set(Bk.x, lerp(Bk.y - Bk.r - 2, SPACE_GW + 13, ease(q)), fade(q, .05, .9));
      spark2.set(Cu.x, lerp(Cu.y - Cu.r - 2, SPACE_GW + 13, ease(q)), fade(q, .05, .9));
      if (p > .6) { Bk.setBadge(seg(p, .6, .72), 'ok'); Cu.setBadge(seg(p, .6, .72), 'ok'); }
      space.glow(p > .55 && p < .95);
    }});
  // 2 of 5 · the source anchor accepts the funds on its reserve account
  // The funds enter the anchor from its right side, so they cross no label.
  K.add({dur:1150, sim:.5, cap:`2 of 5 · Accept. The ${from} anchor accepts the ${dutyT} on its reserve account. AFC holds no funds; the anchor does.`, run:p => {
    const [x, y] = quad(Bk.x, Bk.y + 16, 260, 230, I.fromAnchor.x + 34, I.fromAnchor.y + 6, ease(seg(p, 0, .85)));
    funds.set(x, y, Math.min(seg(p, 0, .04), 1 - seg(p, .84, 1)));
  }});
  // 3 of 5 · after acceptance the proof is recorded in NodeChain and ArosCoin is issued 1 = 1
  K.add({dur:1500, sim:.5, cap:'3 of 5 · Issue. After acceptance, AFC instructs NodeChain (AST) to record the proof. ArosCoin is issued 1 = 1 against the confirmed funds.',
    start:() => { T.m.pot++; },
    run:p => {
      const q = seg(p, 0, .7);
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y + 26, 330, 40, I.chain.x, I.chain.y + 26, ease(q));
      spark3.set(x, y, fade(q, .05, .7));
      aro.set(I.chain.x, I.chain.y + 16, seg(p, .6, 1));
    }});
  // 4 of 5 · the payout anchor accepts ArosCoin; both legs are in the same currency, so nothing is converted
  K.coins(aro, I.chain, I.toAnchor, `4 of 5 · Accept. The payout anchor accepts ArosCoin. AFC checks its ${from} reserve. Both legs use ${from}, so nothing is converted.`, .5, {fadeOut:true});
  // 5 of 5 · output: customs is credited on its own books; its own checks and notices leave through the gateway
  K.add({dur:2800, sim:48, cap:`5 of 5 · Output. Customs is credited on its own books, matches ${did} and signs the release order. Inspection, if selected, takes the same time as today.`,
    run:p => {
      Cu.setRings(Math.min(seg(p, 0, .06), 1 - seg(p, .3, .36)));
      const q = seg(p, .36, .6);
      const [x, y] = quad(I.toAnchor.x, I.toAnchor.y + 16, 960, 150, Cu.x, Cu.y + 16, ease(q));
      paid.set(x, y, Math.min(seg(q, 0, .06), 1 - seg(q, .9, 1)));
      inCu.set(Cu.x, Cu.y + 16, seg(p, .58, .66));
      Cu.setFlash(.45*Math.sin(Math.PI*seg(p, .6, .8)));
      const n1 = seg(p, .72, .9), n2 = seg(p, .8, 1);
      notes[0].set(Bk.x, lerp(SPACE_GW + 26, Bk.y - 28, ease(n1)), fade(n1, .15, .85));
      notes[1].set(Im.x, lerp(SPACE_GW + 26, Im.y - 28, ease(n2)), fade(n2, .15, .85));
      space.glow(p > .7);
    }});

  T.rows = () => [['Paper documents', '0', false], ['Proof of transaction', T.m.pot ? '1' : '0', false], ['Token before acceptance', '0', false], ['API calls', String(T.m.api), false], ['Data shared with the bank', T.m.sh ? 'reference + duty' : '—', false]];
  T.summary = () => [['Elapsed (illustrative)', fmtDur(T.m.sim, T.unit)], ['Peak value of goods held', '—'], ['Time goods held at the border', 'only if inspected, as today'], ['Messages & paper documents', String(T.m.msgs + T.m.docs)], ['Payment proof', 'none: linked by ID'], ['Customs sees the payment', 'at step 5, by its ID']];
  T.doneText = `Done. The bank and customs each confirmed on their own books, linked by ${did}. No paper proof travelled. An inspection, where selected, takes the same time as today.`;
}

GOV.push({
  key:'gov-customs', no:'G04', group:'Government',
  name:'Customs', sub:'Paper proof vs linked duty payment',
  inputs:[ {id:'org', label:'Your customs office', type:'text', def:'Port Customs Office'},
           {id:'importer', label:'Importer', type:'text', def:'Meridian Imports Ltd'},
           {id:'from', label:'Currency', type:'currency', def:'USD'},
           {id:'amount', label:'Customs value of goods', type:'amount', def:800000},
           {id:'rate', label:'Duty rate (%)', type:'number', def:12, min:1, max:40} ],
  lede:'An importer pays duty before its goods leave the port yard. Today the bank pays without the declaration number, and the proof travels back on paper. With AFC the duty payment is linked to the declaration ID, and customs still decides release.',
  note:'Illustrative model. The duty rate, the waits and the inspection time are examples, not tariffs, service levels or measurements. Customs classifies, values, assesses duty, inspects and decides release on its own data; AFC does none of this. Where the risk system selects a shipment, the physical inspection takes the same time on both tracks. The bank sees only the declaration ID, as the payment reference, and the duty amount (selective disclosure); customs keeps the full declaration. The With AFC track does not show classification, valuation, risk selection, a duty dispute or an appeal: customs handles those on its own records, with human review and the right to appeal; nothing is refused automatically. AFC is a logical process layer: it holds no funds, the anchors hold their own reserves, and the bank and customs settle on their own books. The protocol (PoT) fee has no amount until its tariff is set. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Paper proof and an unmatched payment', vbH:462, unit:'h', build:g04Today},
  next:{tag:'With AFC', title:'Duty linked to the declaration ID', vbH:420, unit:'h', build:g04Afc}
});
