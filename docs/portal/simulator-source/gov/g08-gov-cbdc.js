/* ================= G08 · CBDC and bank deposits ================= */
// Today: two ledgers with separate hours; a prefunded settlement account (Deposit → CBDC); a real block on the bank's own ledger; messages, a channel queue, files, e-mail and a manual match.
// With AFC: one process in its own framed space. Each leg settles on its own books. The legs are linked by evidence; no atomicity across the two systems is claimed.
// Illustrative: hours, waits and amounts are examples. Typical practice varies by country; no step is presented as a universal rule.
function g08Vars(T){
  const v = T.cfg.v, {from, amount} = T.cfg;
  return {org: v.org || 'Bank A', cb: v.cb || 'Central Bank', from, amount, amt: money(amount, from), toCbdc: (v.dir || 'Deposit → CBDC') !== 'CBDC → Deposit'};
}
function g08Short(s, n=20){ return s.length > n ? s.slice(0, n - 1) + '…' : s; }
function g08Compact(v, cur){
  try { return new Intl.NumberFormat('en', {style:'currency', currency:cur, notation:'compact', maximumFractionDigits:2}).format(v); }
  catch { return Math.round(v).toLocaleString('en') + ' ' + cur; }
}
// A ledger card: whose liability it is, the booked entry and the ledger status. Coins on the card show the value held on that ledger.
function g08Ledger(T, x, y, w, title, liab, tint, status){
  const g = svgEl('g', {transform:`translate(${x},${y})`}, T.layers.paths), h = 92;
  svgEl('rect', {x:0, y:0, width:w, height:h, rx:10, fill:'#FFFFFF', stroke:C.ink, 'stroke-width':1.3}, g);
  const halo = svgEl('rect', {x:0, y:0, width:w, height:h, rx:10, fill:'none', stroke:C.neonGlow, 'stroke-width':6, opacity:0, filter:glowFilter(g)}, g);
  svgEl('circle', {cx:19, cy:19, r:5, fill:tint}, g);
  const t = svgEl('text', {x:31, y:23, 'font-size':11.5, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, g); t.textContent = title;
  const l = svgEl('text', {x:19, y:42, 'font-size':13.5, fill:C.ink}, g); l.textContent = liab;
  const e = svgEl('text', {x:19, y:69, 'font-size':19, 'font-weight':600, fill:C.muted}, g); e.textContent = 'No entry yet';
  const s = svgEl('text', {x:19, y:86, 'font-size':12.5, fill:C.muted}, g); s.textContent = status;
  return {x, y, w, h, coinAt:[x + w - 38, y + 37],
    entry(text, color){ if (e.textContent !== text) e.textContent = text; e.setAttribute('font-size', text.length > 17 ? 17 : 19); e.setAttribute('fill', color || C.muted); },
    status(text, color){ if (s.textContent !== text) s.textContent = text; s.setAttribute('fill', color || C.muted); },
    glow(a){ halo.setAttribute('opacity', a); }};
}
function g08On(c, led, p){ c.set(led.coinAt[0], led.coinAt[1] + 8*(1 - ease(p)), clamp(p)); }
function g08Off(c, led, p){ c.set(led.coinAt[0], led.coinAt[1] - 10*ease(p), 1 - clamp(p)); }
// One With-AFC step. Several institution checks, coin moves and badges run together inside it, under one caption, so the step counter matches the number of captions.
function g08Beat(T, K, cap, sim, fill){
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

function g08Today(T, K){
  const {org, cb, from, amt, toCbdc} = g08Vars(T), Y = 205, so = g08Short(org), sc = g08Short(cb), cm = g08Compact(T.cfg.amount, from);
  const B = makeNode(T, {x:140, y:Y, r:52, label:org, sub:'Commercial bank'});
  const CB = makeNode(T, {x:860, y:Y, r:52, label:cb, sub:'Central bank'});
  const O = makeNode(T, {x:500, y:376, r:38, labelPos:'right', label:'Back office', sub:'Manual matching', hidden:true});
  const LD = g08Ledger(T, 15, 340, 250, 'DEPOSIT LEDGER', 'Bank liability', '#6B7A90', 'Open · 08:00–18:00');
  const LC = g08Ledger(T, 735, 340, 250, 'CBDC LEDGER', 'Central bank liability', '#0F7E9B', 'Open · 09:00–17:00');
  const src = toCbdc ? LD : LC, dst = toCbdc ? LC : LD;
  const srcCoins = makeCoins(T.layers.tokens, from, 4, src.coinAt[0], src.coinAt[1]);
  const dstCoins = makeCoins(T.layers.tokens, from, 4, dst.coinAt[0], dst.coinAt[1], 0);
  const pre = makeCoins(T.layers.tokens, from, 3, B.x, B.y + 16, 0);
  src.entry('Funds in place', C.ink);
  const leg = toCbdc ? 'CBDC' : 'redemption';

  // Earlier that afternoon (Deposit → CBDC only): the bank prefunds its settlement account, and that money sits idle.
  if (toCbdc) {
    K.travel(B, CB, makeEnvelope(T.layers.tokens, 1, 'RTGS'), 'Earlier that afternoon, in this example, treasury prefunds the bank’s settlement account at the central bank by RTGS payment.', 0, {count:'msgs'});
    K.coins(pre, B, CB, 'The prefunded amount sits in the settlement account. It stays idle until the central bank issues CBDC against it.', 0, {bend:-30});
  }

  // 17:30: the bank's own checks, then the hold on its own ledger (real: the amount is blocked until the debit posts).
  K.pulse(B, `At 17:30 ${org} asks to move ${amt} ${toCbdc ? 'from its deposit ledger to the CBDC ledger' : 'from the CBDC ledger back to its deposit ledger'}. Two ledgers, two sets of hours.`, 0);
  K.check(B, `${org} checks the request on its own books: available ${toCbdc ? 'balance' : 'CBDC balance in its wallet'} and daily limit.`, .02);
  K.check(B, 'Sanctions and AML screening of the instruction and both accounts run in the bank’s own compliance system.', .03);
  K.check(B, `${org} checks its intraday liquidity limit. The central bank’s ledger closed at 17:00, so nothing can go out now.`, .02);
  K.stamp(B, [toCbdc ? 'Balance available' : 'CBDC balance found', 'Screening passed', 'Second approver signs'], `${org} approves the request internally. As is typical for treasury payments, a second approver signs off (four-eyes).`, .05, so);
  if (toCbdc) K.hold(B, amt, `${org} blocks ${amt} on its deposit ledger while the instruction waits. The block is real: the amount is not available to other payments.`, .1);

  // The overnight wait: the CBDC ledger is closed; the instruction sits in the bank's outbox until 09:00 (illustrative, the clock shows it).
  K.add({dur:1700, sim:toCbdc ? 15.28 : 15.38, cap:`The CBDC ledger closed at 17:00 and the bank ledger runs to 18:00. The instruction waits in the bank’s outbox until ${cb} reopens at 09:00.`,
    start:() => LC.status('Closed · reopens 09:00', C.hold),
    run:p => LC.glow(.45*Math.sin(Math.PI*p)),
    end:() => { LC.status('Open · 09:00–17:00', C.ok); LC.glow(0); }});

  // 09:00 next day: an operator releases the instruction and sends it through the central bank's own channel.
  K.check(B, 'Before release, an operator re-checks the queued instruction against the policy version on file.', .05);
  K.travel(B, CB, makeEnvelope(T.layers.tokens, 1, 'INSTRUCTION'), 'At 09:00 an operator releases the instruction. It goes out through the central bank’s own channel.', .2, {count:'msgs'});
  K.check(CB, `${cb} validates the message format and checks the bank’s participant permission on its own system.`, .1);
  K.check(CB, `${cb} checks the participant limit and the ${toCbdc ? 'prefunded balance on the settlement account' : 'bank’s CBDC balance in its wallet'}, on its own ledger.`, .1);
  K.stamp(CB, ['Participant permitted', toCbdc ? 'Prefunding matched' : 'CBDC balance found', 'Limit within cap'], `${cb} approves the request.`, .2, sc);
  K.badge([[CB, 'ok']], `A second operator at ${cb} signs the posting. Dual control applies, as is typical.`, .1);
  if (toCbdc) {
    K.add({dur:1500, sim:.2, cap:`${cb} issues ${amt} of CBDC on its own ledger, drawing on the prefunded funds. CBDC is a liability of the central bank.`,
      run:p => { pre.set(CB.x, CB.y + 16, 1 - seg(p, 0, .45)); g08On(dstCoins, LC, seg(p, .25, .85)); LC.glow(.6*Math.sin(Math.PI*p)); CB.setFlash(.5*Math.sin(Math.PI*p)); if (p > .5) LC.entry(`Issued +${cm}`, C.ok); },
      end:() => LC.glow(0)});
  } else {
    K.hold(CB, amt, `${cb} blocks ${amt} of CBDC in the bank’s wallet until the redemption is booked.`, .1);
    K.add({dur:1500, sim:.2, cap:`${cb} redeems ${amt} of CBDC on its own ledger and retires it from circulation. CBDC is a liability of the central bank.`,
      run:p => { g08Off(srcCoins, LC, seg(p, .25, .85)); CB.releaseLock(seg(p, .6, 1)); LC.glow(.6*Math.sin(Math.PI*p)); CB.setFlash(.5*Math.sin(Math.PI*p)); if (p > .5) LC.entry(`Redeemed −${cm}`, C.ok); },
      end:() => { LC.glow(0); T.holdOff(); }});
  }

  // Confirmation by message; the bank keys it in by hand; an acknowledgement goes back; monitoring is batch.
  K.travel(CB, B, makeEnvelope(T.layers.tokens, 1, 'CONFIRMATION'), `${cb} confirms by message. The confirmation lands in the bank’s channel, outside its core system.`, .3, {count:'msgs', bend:-55});
  K.check(B, 'The confirmation waits in the channel queue. An operator picks it up and checks it against the instruction.', .8);
  K.check(B, 'The operator keys the confirmation into the core system by hand. In this example nothing posts automatically.', .3);
  K.travel(B, CB, makeEnvelope(T.layers.tokens, 1, 'ACK'), `The bank sends a technical acknowledgement back to ${cb} through the same channel.`, .1, {count:'msgs', bend:55});
  K.badge([[B, 'ok']], toCbdc ? 'The bank marks the CBDC leg as received. Its deposit debit stays open until the books agree.' : 'The bank marks the redemption as received. Its deposit credit stays open until the books agree.', .05);
  K.add({dur:1100, sim:.2, cap:'The transfer enters the bank’s monitoring queue for next-day batch review.', run:p => B.setFlash(.25*Math.sin(Math.PI*p))});

  // 18:00 close of day, the evening batch, the central bank's overnight run, and the two statements as files.
  K.travel(B, O, makeDoc(T.layers.tokens, 'DEPOSIT STMT'), 'At 18:00 the bank ledger closes. The bank exports its deposit ledger as a statement file for the back office.', 6.3, {count:'docs', burn:false});
  K.add({dur:1200, sim:.3, cap:`The evening batch posts the ${leg} leg to the general ledger. The bank’s ledger is closed for the day.`,
    start:() => LD.status('Closed for the day', C.muted), run:p => LD.glow(.4*Math.sin(Math.PI*p)), end:() => LD.glow(0)});
  K.add({dur:1500, sim:5, cap:`Overnight ${cb} reconciles its settlement account and its CBDC ledger. The CBDC ledger reopens at 09:00.`,
    run:p => { LC.glow(.5*Math.sin(Math.PI*p)); CB.setFlash(.25*Math.sin(Math.PI*p)); }, end:() => LC.glow(0)});
  K.travel(CB, B, makeEnvelope(T.layers.tokens, 1, 'POSITION'), `Early the next morning ${cb} sends its position report to the bank by message. It is a second message, not the statement.`, 8.7, {count:'msgs', bend:-55});
  K.travel(CB, O, makeDoc(T.layers.tokens, 'CBDC STMT'), `The central bank’s CBDC statement arrives at the back office as a file, after its end-of-day run.`, .5, {count:'docs'});

  // Reconciliation by hand: a re-run extract, a line-by-line match, a break, e-mail, a journal and a printout.
  K.check(O, 'In this example the first deposit extract has a formatting error. Staff re-run it from the core system.', .2);
  K.check(O, 'The back office loads both files into a spreadsheet and matches them line by line.', .5);
  K.badge([[O, 'fail']], 'One line does not match: the value dates differ. Staff e-mail both sides. A person decides, not a system.', .3);
  K.check(O, 'The break is raised as an exception and assigned to a case handler. It stays open until both sides reply.', .2);
  K.travel(O, CB, makeEnvelope(T.layers.tokens, 1, 'E-MAIL'), `Staff e-mail the central bank’s operations desk with the line and both value dates.`, .2, {count:'msgs'});
  K.travel(CB, O, makeEnvelope(T.layers.tokens, 1, 'E-MAIL'), 'In the afternoon the central bank replies by e-mail. Its ledger used the value date it booked on the day.', 5, {count:'msgs', bend:-55});
  K.check(O, 'The value dates are agreed by e-mail. The entries are matched by hand against both statements.', .7);
  K.badge([[O, 'ok']], 'The break is cleared by e-mail. Every line now matches in the spreadsheet.', .3);
  K.stamp(O, ['Journal prepared', 'Controller signs', 'Printout filed'], `Finance posts the ${toCbdc ? 'CBDC' : 'deposit'} entry in the general ledger as a manual journal. The controller signs; the printout is filed, as is typical.`, .5, 'Back office');
  K.travel(O, B, makeDoc(T.layers.tokens, 'JOURNAL'), 'The signed journal goes back to the bank’s core system as a file for the overnight batch.', .3, {count:'docs'});
  K.check(B, 'Compliance clears the next-day monitoring review by hand. In this example it finds nothing to change.', .3);

  // Next morning: the overnight batch posts the bank's side, and only then is the block released (real hold) or the credit shown.
  if (toCbdc) {
    K.add({dur:1500, sim:16, cap:'Next morning the overnight batch posts the debit and releases the block. In this example that is about two days after the request.',
      run:p => { g08Off(srcCoins, LD, seg(p, .25, .85)); B.releaseLock(seg(p, 0, .5)); LD.glow(.6*Math.sin(Math.PI*p)); B.setFlash(.5*Math.sin(Math.PI*p)); if (p > .5) LD.entry(`Debit −${cm}`, C.ok); },
      end:() => { LD.glow(0); LD.status('Open · 08:00–18:00', C.ok); T.holdOff(); }});
  } else {
    K.add({dur:1500, sim:16, cap:'Next morning the overnight batch credits the deposit ledger. In this example that is about two days after the request.',
      run:p => { g08On(dstCoins, LD, seg(p, .25, .85)); LD.glow(.6*Math.sin(Math.PI*p)); B.setFlash(.5*Math.sin(Math.PI*p)); if (p > .5) LD.entry(`Credit +${cm}`, C.ok); },
      end:() => { LD.glow(0); LD.status('Open · 08:00–18:00', C.ok); }});
  }

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), R.msgs(T), R.docs(T)];
  T.extraSummary = () => [['Prefunding rule', toCbdc ? `prefunded, ${amt} idle` : 'none'], ['Matching between ledgers', 'manual, back office by e-mail']];
  T.doneText = `Done. Both ledgers ended in the right state, but it took two sets of hours${toCbdc ? ', a prefunded account' : ''}, several messages and a manual match.`;
}

function g08Afc(T, K){
  const {org, cb, from, toCbdc} = g08Vars(T);
  // The process space: the deposit anchor always sits on the left, the CBDC anchor on the right, whichever way the money goes. AFC is not drawn; captions name it.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', 'Deposit anchor', 'Bank leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', 'CBDC anchor', 'Central bank leg']
  ]);
  const I = space.inside, dep = I.fromAnchor, cbd = I.toAnchor;
  const srcA = toCbdc ? dep : cbd, dstA = toCbdc ? cbd : dep;
  // Outside the frame: the two institutions, each reaching the process only through the gateway.
  const [xB, xC] = planeXs(2);
  const B = makeNode(T, {x:xB, y:INST_Y, r:50, label:org, sub:'Deposit ledger', lockAt:[70, -20]});
  const CB = makeNode(T, {x:xC, y:INST_Y, r:50, label:cb, sub:'CBDC ledger', lockAt:[70, -20]});
  space.connect([B, CB]);
  const gB = {x:B.x, y:SPACE_GW, r:0, presence:1, setPresence(){}}, gC = {x:CB.x, y:SPACE_GW, r:0, presence:1, setPresence(){}};
  const srcInst = toCbdc ? B : CB;
  const cash = makeCoins(T.layers.tokens, from, 4, srcInst.x, srcInst.y + 16, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 4, I.chain.x, I.chain.y + 16, 0);
  const spark = space.sig();
  const ft = floatText(T.layers.fx, I.chain.x, I.chain.y - 36, '1 = 1', C.afc);
  const closed = svgEl('text', {x:I.toAnchor.x, y:60, 'text-anchor':'middle', 'font-size':12.5, 'letter-spacing':1.6, 'font-weight':600, fill:C.ink, opacity:0}, T.layers.fx);
  closed.textContent = 'CLOSED UNTIL 09:00';
  const closedFade = p => closed.setAttribute('opacity', Math.min(seg(p, 0, .2), 1 - seg(p, .8, 1)));
  T.m.linked = false;

  // 1 of 5 · the bank checks its own data, then one confirmed instruction goes through the gateway; AFC routes it.
  g08Beat(T, K, toCbdc
    ? '1 of 5 · Request. The bank runs its own checks, then sends one confirmed instruction and its funds through the gateway. AFC routes it to the deposit leg.'
    : '1 of 5 · Request. The bank runs its own checks, then sends one confirmed instruction through the gateway. AFC routes it to the CBDC leg.', .02, k => {
    k.check(B, '', 0, 2000);
    k.badge([[B, 'ok']], '', 0);
    k.api(B, space, '', 0);
    if (toCbdc) k.coins(cash, B, gB, '', 0, {fadeOut:true, dur:1200});
  });

  // 2 of 5 · the source leg accepts the funds on its own reserve. For CBDC → Deposit the CBDC leg is closed until 09:00 first.
  g08Beat(T, K, toCbdc
    ? '2 of 5 · Accept. The deposit anchor accepts the funds on its own reserve account. AFC checks them against the instruction, and the transaction is confirmed.'
    : '2 of 5 · Accept. The CBDC leg is closed until 09:00. At 09:00 the central bank checks permission, limit and availability; the CBDC anchor accepts the funds on its reserve.', toCbdc ? .02 : 15.46, k => {
    if (toCbdc) {
      k.coins(cash, gB, dep, '', 0, {fadeOut:true, dur:1300});
      k.check(dep, '', 0, 1500);
      k.badge([[dep, 'ok']], '', 0);
    } else {
      k.add({dur:2600, run:closedFade});
      k.check(CB, '', 0, 2000);
      k.badge([[CB, 'ok']], '', 0);
      k.coins(cash, CB, gC, '', 0, {fadeOut:true, dur:1200});
      k.coins(cash, gC, cbd, '', 0, {fadeOut:true, dur:1300});
      k.check(cbd, '', 0, 1000);
      k.badge([[cbd, 'ok']], '', 0);
    }
  });

  // 3 of 5 · only after acceptance: the proof of transaction goes to NodeChain and AST issues ArosCoin 1 = 1.
  g08Beat(T, K, toCbdc
    ? '3 of 5 · Issue. After acceptance, the proof goes to NodeChain and AST issues ArosCoin 1 = 1. The CBDC leg is closed until 09:00, so the process waits.'
    : '3 of 5 · Issue. After acceptance, the proof goes to NodeChain and AST issues ArosCoin 1 = 1. No token exists before the funds are accepted.', toCbdc ? 15.46 : .01, k => {
    k.add({dur:1300, start:() => { T.m.pot++; }, end:() => { T.m.protoFee = true; }, run:p => spark.set(lerp(srcA.x, I.chain.x, ease(p)), I.chain.y, fade(p, .05, .9))});
    k.add({dur:1000, run:p => { aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)); ft.set(p); }});
    if (toCbdc) k.add({dur:3000, run:closedFade});
  });

  // 4 of 5 · the output leg's institution checks its own ledger; the output anchor accepts ArosCoin and converts it 1 = 1.
  g08Beat(T, K, toCbdc
    ? '4 of 5 · Accept and convert. At 09:00 the central bank checks permission, limit and availability. The CBDC anchor accepts ArosCoin and converts it 1 = 1.'
    : '4 of 5 · Accept and convert. The deposit anchor accepts ArosCoin and converts it 1 = 1. The bank checks its own deposit account and limit.', .01, k => {
    k.check(toCbdc ? CB : B, '', 0, 2000);
    k.badge([[toCbdc ? CB : B, 'ok']], '', 0);
    k.coins(aro, I.chain, dstA, '', 0, {fadeOut:true, dur:1300, arrive:() => aro.recur(from)});
    k.badge([[dstA, 'ok']], '', 0);
  });

  // 5 of 5 · output: each ledger books its own leg (no money crosses the frame); notices leave through the gateway.
  g08Beat(T, K, toCbdc
    ? '5 of 5 · Output. Each ledger books its own leg: the bank is debited, the central bank issues CBDC. Notices go out. The process ends.'
    : '5 of 5 · Output. Each ledger books its own leg: the central bank redeems CBDC, the bank is credited. Notices go out. The process ends.', .02, k => {
    settleStep(T, k, srcInst, toCbdc ? CB : B, from, from, '', 0, 1100);
    notify(T, k, space, B, '', 0);
    notify(T, k, space, CB, '', 0);
    k.add({dur:300, end:() => { T.m.linked = true; }});
  });

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), R.api(T), ['Matching between ledgers', T.m.linked ? 'linked by evidence' : '—', false]];
  T.extraSummary = () => [['Prefunding rule', 'set by the central bank'], ['PoT fee (ArosCoin)', T.feesText()]];
  T.doneText = 'Done. Each leg booked on its own ledger, linked by evidence in NodeChain. No manual match between the ledgers; each institution still reconciles.';
}

GOV.push({
  key:'gov-cbdc', no:'G08', group:'Government',
  name:'CBDC and bank deposits', sub:'Two ledgers, linked by evidence',
  inputs:[{id:'org', label:'Your bank', type:'text', def:'Bank A'},
          {id:'cb', label:'Central bank', type:'text', def:'Central Bank'},
          {id:'dir', label:'Direction', type:'select', options:['Deposit → CBDC', 'CBDC → Deposit'], def:'Deposit → CBDC'},
          {id:'from', label:'Currency', type:'currency', def:'EUR'},
          {id:'amount', label:'Amount', type:'amount', def:5000000}],
  lede:'A bank moves value between its deposit ledger and the central bank’s CBDC ledger. Today the ledgers keep separate hours and a manual match, and a prefunded account sits idle. With AFC one process links both legs, and each ledger still books its own.',
  note:'Illustrative model. Hours, waits, prefunding and amounts are examples, not quotes or service levels. The Today steps describe typical bank and central-bank practice, which varies by country and by central bank; no step is a universal rule. CBDC stays a liability of the central bank and deposits stay liabilities of the bank. The With-AFC track does not issue, redeem, debit or credit deposit or CBDC money: each institution books its own leg on its own books, and the two legs are linked by evidence, not merged. No atomic settlement across the two systems is claimed; a failed leg would be held or compensated in its own ledger, never erased. AFC does not extend any ledger’s operating hours, so the CBDC leg waits until 09:00 as it does today. Limits, permissions, reserves and prefunding rules stay with the central bank. AML screening, approvals and each institution’s own reconciliation stay with that institution. ArosCoin is a 1 = 1 process token that exists only after the funds are accepted, and it does not carry the payment. The protocol (PoT) fee has no amount until its tariff is set. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Two ledgers, hours and manual matching', vbH:445, unit:'h', build:g08Today},
  next:{tag:'With AFC', title:'One process, two legs, linked evidence', vbH:420, unit:'h', build:g08Afc}
});
