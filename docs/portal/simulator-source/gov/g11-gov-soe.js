/* ================= G11 · State-owned enterprise treasury ================= */
// Today: a holding with subsidiaries at several banks collects balances by e-mail and PDF, retypes them into a workbook,
// approves the funding on paper and sends a paper transfer order that the receiving bank checks by hand. The payment
// waits for a clearing batch. The institutions talk to each other, as they do now. Waiting times are illustrative.
// With AFC: one process in its own framed space. The banks sit outside the frame and reach it only through the API gateway.
// Each bank checks its own mandate and balance on its own circle. Anchors take money on their reserve accounts and never
// take requests. Five steps, no holds. Each bank books its own side of the transfer.
function g11Vars(T){
  const v = T.cfg.v, {from, amount} = T.cfg, n = Math.max(2, Math.min(5, Math.round(v.n || 3)));
  const bal = [.3, 2.4, .9, 1.6, .6].slice(0, n).map(f => f*amount);
  return {org: v.org || 'State Holding', from, amount, n, amt: money(amount, from), bal, L: ['A', 'B', 'C', 'D', 'E']};
}
function g11Compact(v, cur){
  try { return new Intl.NumberFormat('en', {style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); }
  catch { return Math.round(v).toLocaleString('en') + ' ' + cur; }
}
// The holding's workbook: one row per subsidiary, filled by hand as replies arrive.
function g11Sheet(T, x, y, w, n, L){
  const g = svgEl('g', {transform:`translate(${x},${y})`}, T.layers.nodes), rh = 18, h = 24 + n*rh + 24;
  svgEl('rect', {x:0, y:0, width:w, height:h, rx:8, fill:'#FFFFFF', stroke:C.ink, 'stroke-width':1.3}, g);
  svgEl('path', {d:`M0,24 V8 a8,8 0 0 1 8,-8 H${w - 8} a8,8 0 0 1 8,8 V24 Z`, fill:'#EEF1F5'}, g);
  const t = svgEl('text', {x:10, y:16, 'font-size':10.5, 'letter-spacing':1.4, 'font-weight':600, fill:C.muted}, g); t.textContent = 'GROUP CASH · WORKBOOK';
  const cnt = svgEl('text', {x:w - 10, y:16, 'text-anchor':'end', 'font-size':11, 'font-weight':600, fill:C.muted}, g); cnt.textContent = `0 / ${n}`;
  const rows = [];
  for (let i = 0; i < n; i++) {
    const yy = 24 + i*rh;
    svgEl('line', {x1:0, y1:yy, x2:w, y2:yy, stroke:'#E4E7EC', 'stroke-width':1}, g);
    const a = svgEl('text', {x:10, y:yy + 13, 'font-size':12.5, fill:C.muted}, g); a.textContent = `Sub ${L[i]}`;
    const b = svgEl('text', {x:w - 10, y:yy + 13, 'text-anchor':'end', 'font-size':12.5, fill:C.muted}, g); b.textContent = '—';
    rows.push({a, b});
  }
  const fy = 24 + n*rh;
  svgEl('line', {x1:0, y1:fy, x2:w, y2:fy, stroke:C.rail, 'stroke-width':1.2}, g);
  const fa = svgEl('text', {x:10, y:fy + 16, 'font-size':12.5, 'font-weight':600, fill:C.muted}, g); fa.textContent = 'Group total';
  const fb = svgEl('text', {x:w - 10, y:fy + 16, 'text-anchor':'end', 'font-size':12.5, 'font-weight':600, fill:C.muted}, g); fb.textContent = '—';
  return {h,
    row(i, text, stale){ rows[i].b.textContent = text; rows[i].b.setAttribute('fill', stale ? C.hold : C.ink); rows[i].a.setAttribute('fill', C.ink); },
    count(k){ cnt.textContent = `${k} / ${n}`; },
    total(text, stale){ fb.textContent = text; fb.setAttribute('fill', stale ? C.hold : C.ink); fa.setAttribute('fill', C.ink); }};
}
// A small balance chip drawn under a bank in the With-AFC view. It shows what the holding sees for that subsidiary.
function g11Chip(T, x, y, w, h=26){
  const g = svgEl('g', {opacity:0}, T.layers.fx);
  svgEl('rect', {x:x - w/2, y, width:w, height:h, rx:8, fill:'#FFFFFF', stroke:C.ink, 'stroke-width':1.2}, g);
  const t = svgEl('text', {x, y:y + h/2 + 4.6, 'text-anchor':'middle', 'font-size':13.5, 'font-weight':600, fill:C.ink}, g);
  return {set(text, a, kind){ if (t.textContent !== text) t.textContent = text; t.setAttribute('fill', kind === 'warn' ? C.hold : kind === 'ok' ? C.ok : C.ink); g.setAttribute('opacity', a); }};
}
// One glyph per bank, all in one step; `rev` sends them from the banks to the holding, staggered, and reports each arrival.
function g11Fan(T, K, H, banks, mk, cap, sim, o={}){
  const items = banks.map(b => ({gl:mk(), pts:o.rev ? edge(b, H, 22) : edge(H, b, 22), line:burnPath(T.layers.paths, o.rev ? edge(b, H, 4) : edge(H, b, 4), C.ink, .3)}));
  const k = banks.length;
  K.add({dur:o.dur || 2400, sim, cap, start:() => { if (o.count) T.m[o.count] += k; },
    run:p => items.forEach((it, i) => {
      const lo = o.rev ? .5*i/k : 0, q = seg(p, lo, o.rev ? lo + .5 : 1), e = ease(q);
      it.line.set(e); const [x, y] = quad(...it.pts, e); it.gl.set(x, y, q <= 0 ? 0 : fade(q));
      if (o.onArrive && q > .96) o.onArrive(i);
    })});
}
function g11Layout(n){   // bank positions in the Today view: a vertical stack on the right
  const sp = [0, 0, 140, 110, 92, 84][n], yC = 238;
  return Array.from({length:n}, (_, i) => yC + (i - (n - 1)/2)*sp);
}
function g11Short(s, n=20){ return s.length > n ? s.slice(0, n - 1) + '…' : s; }

/* ---------- Today: the real path, institution by institution ----------
   Every hand-off is a message, a PDF, a paper order, a courier, a queue, a clearing batch or a manual re-keying. */
function g11Today(T, K){
  const {org, from, amount, n, amt, bal, L} = g11Vars(T), cc = v => g11Compact(v, from);
  const H = makeNode(T, {x:125, y:200, r:50, label:org, sub:'Holding · treasury'});
  const ys = g11Layout(n);
  const banks = ys.map((y, i) => makeNode(T, {x:735, y, r:32, small:true, labelPos:'right', label:`Bank ${i + 1}`, sub:`Sub ${L[i]} account`, lockAt:[32 + 24, 36]}));
  const B1 = banks[0], B2 = banks[1];
  const CLR = makeNode(T, {x:470, y:360, r:26, small:true, label:'Clearing', sub:'Batch cut-off', hidden:true});
  const sheet = g11Sheet(T, 20, 322, 250, n, L);
  const stacks = banks.map((b, i) => makeCoins(T.layers.tokens, from, [1, 4, 2, 3, 2][i], b.x, b.y + 16));
  const moved = makeCoins(T.layers.tokens, from, 2, B2.x, B2.y + 16, 0);
  const ftS = floatText(T.layers.fx, B1.x, B1.y - B1.r - 10, 'SHORT', C.hold), ftI = floatText(T.layers.fx, B2.x, B2.y - B2.r - 10, 'IDLE CASH', C.hold);
  const got = new Set();
  T.holdAmount = amount; T.m.age = false;

  // 1–9 · the need, the e-mails and the replies
  K.pulse(H, `${org}’s group treasury needs one cash position across ${n} subsidiaries, each with its own bank, and a funding decision for Sub A.`);
  K.check(H, 'Treasury checks the cash forecast. Sub A’s finance team has e-mailed a shortfall: a supplier payment falls due in three days.', .5);
  g11Fan(T, K, H, banks, () => makeEnvelope(T.layers.tokens, null, 'E-MAIL'), 'Treasury e-mails each bank and each subsidiary for yesterday’s closing balance. Every bank has its own request form and cut-off time.', 1, {count:'msgs', dur:2200});
  K.check(banks, 'Each subsidiary’s controller logs in to its bank’s portal with a password and a one-time code. Some banks first ask for a signed form.', 2, 2600);
  K.check(banks, 'Each bank closes its end-of-day run. Booked, available and blocked balances are different figures, and cut-off times differ by bank.', 18, 2600);
  g11Fan(T, K, H, banks, () => makeDoc(T.layers.tokens, 'PDF'), 'Replies come back over two days as PDFs, spreadsheets and e-mails. Each bank uses its own format and its own time.', 30,
    {rev:true, count:'docs', dur:3400, onArrive:i => { if (!got.has(i)) { got.add(i); sheet.row(i, i === 1 ? `${cc(bal[i])} · 2 d old` : cc(bal[i]), i === 1); sheet.count(got.size); } }});
  K.check(H, 'Staff retype every figure from PDFs and spreadsheets into one workbook, and check each number by hand against its statement.', 4, 2600);
  K.stamp(H, ['Workbook consolidated', 'Position is 2 days old'], 'The group position is known, but it is already two days old.', .2, g11Short(org));
  K.check(H, 'Treasury reconciles the workbook. Cut-off times, value dates and FX rates taken on different days do not match.', 3, 2600);
  K.check(H, 'Treasury keeps a sheet of each bank’s format and cut-off time, and updates it by hand whenever a bank changes its format.', .5, 2200);

  // 10–14 · the query to Bank 2 and the decision
  K.travel(H, B2, makeEnvelope(T.layers.tokens, null, 'QUERY'), 'Treasury queries Bank 2: its PDF total differs from Sub B’s ledger by a blocked amount. The query waits for the bank.', 4, {count:'msgs'});
  K.check(B2, 'Bank 2 checks its own ledger. A second officer signs off the corrected statement, which goes out the next morning.', 16, 2800);
  K.travel(B2, H, makeDoc(T.layers.tokens, 'STATEMENT'), 'Bank 2 e-mails the corrected statement as a PDF. Treasury updates one row of the workbook by hand.', 1, {count:'docs', burn:false});
  K.add({dur:1600, sim:.5, cap:`The workbook shows Sub B holding idle cash at Bank 2, while Sub A at Bank 1 needs ${amt}.`,
    start:() => { T.m.age = true; sheet.total(cc(bal.reduce((s, v) => s + v, 0)) + ' · 2 d old', true); },
    run:p => { const a = Math.min(seg(p, 0, .15), 1 - seg(p, .85, 1)); B1.setRings(a); B2.setRings(a); ftS.set(seg(p, .1, .9)); ftI.set(seg(p, .1, .9)); },
    end:() => { B1.setRings(0); B2.setRings(0); }});
  K.check(H, 'The group CFO reviews the funding proposal under the treasury policy. Above the policy limit, the holding’s board must approve as well.', 4, 2800);
  K.stamp(H, ['CFO approved', 'Board: if above limit'], 'Approvals are minuted. Limits and approvers differ by country and by holding; the minutes are filed on paper or as scanned PDFs.', .5, 'Approval');

  // 15–19 · the intra-group loan, the paper trail and the courier
  K.check(H, 'The tax team checks the interest rate on the intra-group loan against transfer-pricing rules. Typically one to two days.', 24, 2600);
  K.check(H, 'Legal drafts the intra-group loan agreement. Both subsidiaries’ directors sign paper originals, which are kept on file.', 24, 2600);
  K.travel(H, B2, makeEnvelope(T.layers.tokens, null, 'SCAN'), 'Treasury e-mails a scan of the draft loan and the transfer request to Bank 2’s compliance team.', 2, {count:'msgs'});
  K.check(B2, 'Bank 2’s compliance team asks for the signed loan agreement before it releases any payment. The payment waits for the document.', 12, 2800);
  K.travel(H, B2, makeDoc(T.layers.tokens, 'ORDER'), `Treasury couriers the signed agreement and the paper transfer order for ${amt} to Bank 2. Typically a day or two in the post.`, 24, {count:'docs', burn:false});

  // 21–27 · the bank’s own checks, the hold and the clearing batch
  K.check(B2, 'Bank 2 compares the order’s signatures with its specimen cards and checks that Sub B’s director is still authorised.', 4, 2600);
  K.check(B2, 'A second officer keys the order into the corporate banking system and approves it. Two people must act on every payment.', 3, 2600);
  K.check(B2, 'Bank 2 calls Sub B’s director on a registered number to confirm the order. The call-back is a fraud control and takes about an hour.', 2, 2400);
  K.hold(B2, amt, `Bank 2 reserves ${amt} on Sub B’s account until the payment is sent. The money is still Sub B’s, but it cannot be used.`, .3);
  K.travel(B2, CLR, makeEnvelope(T.layers.tokens, null, 'PAYMENT'), 'Bank 2 submits the payment to the clearing system. The batch closes at a fixed time, and this payment arrives after it.', 2, {count:'msgs'});
  K.check(CLR, 'The clearing system checks format, duplicates and bank limits, then queues the payment for the next batch. Typically the next business day.', 12, 2600);
  K.travel(H, B1, makeEnvelope(T.layers.tokens, null, 'CHASER'), 'Treasury e-mails Bank 1 to ask when Sub A will be credited. Bank 1 answers that it depends on the batch.', 6, {count:'msgs', burn:false});

  // 28–33 · the batch, the credit and the workbook that is out of date again
  K.release(B2, 'The next morning the batch runs. Bank 2 releases the reservation as the payment leaves its books.', 2);
  K.coins(moved, B2, CLR, 'Bank 2’s side of the payment goes into the clearing system.', .3, {fadeOut:true, dur:1100});
  K.coins(moved, CLR, B1, 'The clearing system credits Bank 1. Sub A’s funding arrives about a day after the order was approved.', 1, {fadeOut:true, dur:1300, arrive:() => { drawCoins(stacks[0].g, from, 3); drawCoins(stacks[1].g, from, 2); }});
  K.check(B1, 'Bank 1 checks the beneficiary name and account and runs sanctions screening. It then credits Sub A after its own checks.', 2, 2600);
  K.travel(B1, H, makeEnvelope(T.layers.tokens, 1, 'CREDIT ADVICE'), 'Bank 1 confirms by e-mail. Treasury matches the credit to the paper order by hand, using the reference Bank 2 typed in.', 4, {count:'msgs', burn:false});
  K.add({dur:1300, sim:.5, cap:'Sub A is funded days after the need was spotted, and the workbook is already out of date again.',
    run:p => { B1.setBadge(p, 'ok'); H.setFlash(.5*Math.sin(Math.PI*p)); if (p > .5) { sheet.row(0, `${cc(bal[0])} · old`, true); sheet.row(1, `${cc(bal[1])} · old`, true); } }});

  // 34–40 · the books, the month-end match and the report
  K.check(B2, 'Bank 2’s next statement shows the debit. Sub B’s controller matches it to the ledger by hand.', 24, 2600);
  K.check(H, 'Treasury re-keys the new balances into the cash forecast and e-mails the update to the group. The forecast is again a day old.', 1, 2400);
  K.stamp(H, ['Loan booked', 'Both ledgers matched by hand'], 'Each subsidiary books the loan in its own system. The paper trail is filed separately by each bank and by the holding.', 2, 'Booked');
  K.check(H, 'At month-end the accounts team matches the intra-group balances. A one-day timing difference is common, and it is chased by e-mail.', 0, 2800);
  K.add({dur:1100, sim:0, cap:'The owner gets a consolidated cash report built on a position that was already days old when it was prepared.', run:p => H.setFlash(.4*Math.sin(Math.PI*p))});

  T.rows = () => [R.holds(T), R.holdTime(T), R.msgs(T), R.docs(T), ['Position age', T.m.age ? '2 days' : '—', T.m.age]];
  T.extraSummary = () => [['Group position known after', 'about 2 days (illustrative)'], ['Idle cash while waiting', 'several days (illustrative)']];
  T.doneText = `Done. ${n} banks answered by e-mail and paper, the workbook was retyped by hand, and Sub A was funded days later through a paper order and a clearing batch. All durations are illustrative.`;
}

/* ---------- With AFC: one process in one framed space, five steps ----------
   Banks sit outside the frame and reach it only through the API gateway. No bank is linked to an internal part or to
   another bank. The anchors take money on their reserve accounts and never take requests. Each bank checks its own
   mandate and balance on its own circle. There are no holds: every condition is a check on the bank's own circle.
   Each step is one animation call; its parts run back to back so the counter matches the captions. */
function g11Afc(T, K){
  const {org, from, amount, n, amt, bal, L} = g11Vars(T), cc = v => g11Compact(v, from), Y = INST_Y;
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Accepts'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${from}`, 'Pays out']
  ]);
  const I = space.inside, xs = planeXs(n + 1);
  const H = makeNode(T, {x:xs[0], y:Y, r:40, label:g11Short(org, 18), sub:'Treasury', lockAt:[70, -20]});
  const banks = xs.slice(1).map((x, i) => makeNode(T, {x, y:Y, r:34, small:true, label:`Bank ${i + 1}`, sub:`Sub ${L[i]} account`, lockAt:[70, -20]}));
  const B1 = banks[0], B2 = banks[1];   // Sub A’s bank receives the funds; Sub B’s bank sends them
  space.connect([H, ...banks]);
  const chips = banks.map(b => g11Chip(T, b.x, Y + b.r + 66, 118));
  const bankText = i => i === 0 ? `${cc(bal[0])} · short` : i === 1 ? `${cc(bal[1])} · idle` : cc(bal[i]);
  const funds = makeCoins(T.layers.tokens, from, 3, B2.x, B2.y, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 3, I.chain.x, I.chain.y + 16, 0);
  const pot = space.sig(), ft = floatText(T.layers.fx, I.chain.x, I.chain.y - 42, '1 = 1', C.afc);
  const sH = space.sig(), sB = banks.map(() => space.sig()), sI = space.sig(), sC = space.sig();
  T.holdAmount = amount; T.m.mand = 0; T.m.conf = 0;

  const beat = (cap, sim, fill) => {
    const outer = T.steps, S = kit(T), parts = T.steps; T.steps = outer;
    fill(S);
    const total = parts.reduce((a, s) => a + s.dur, 0);
    let acc = 0;
    const seq = parts.map(s => { const a = acc/total; acc += s.dur; return {s, a, b:acc/total, on:false, off:false}; });
    K.add({dur:total, sim, cap, run:p => seq.forEach(q => {
      if (q.off || p < q.a) return;
      if (!q.on) { q.on = true; q.s.start && q.s.start(); }
      const t = seg(p, q.a, q.b);
      q.s.run && q.s.run(t);
      if (t >= 1) { q.s.end && q.s.end(); q.off = true; }
    })});
  };

  // 1 of 5 · the holding asks for the group position; each bank confirms its own balance under its mandate
  beat(`1 of 5 · View. Treasury asks for the group position. AFC routes the request to each bank, which confirms its own subsidiary’s balance under its mandate.`, .05, S => {
    S.add({dur:800, start:() => { T.m.api++; T.m.mand = n; }, run:p => sH.set(H.x, lerp(H.y - H.r, space.busY, ease(p)), fade(p, .1, .9))});
    S.add({dur:1000, run:p => { const a = Math.min(seg(p, 0, .2), 1 - seg(p, .8, 1)); banks.forEach(b => b.setRings(a)); space.scan(p, a); },
      end:() => { banks.forEach(b => b.setRings(0)); space.scan(0, 0); }});
    S.add({dur:1000, start:() => { T.m.api += n; T.m.conf = n; }, run:p => banks.forEach((b, i) => {
      sB[i].set(b.x, lerp(b.y - b.r, space.busY, ease(p)), fade(p, .1, .9));
      b.setBadge(seg(p, .6, 1), 'ok');
      chips[i].set(bankText(i), seg(p, .4, .8), i < 2 ? 'warn' : 'ink');
    })});
    notify(T, S, space, H, '', 0);
  });

  // 2 of 5 · treasury instructs the transfer; Bank 2 confirms the debit; the anchor accepts the funds on its reserve
  beat(`2 of 5 · Request and accept. Treasury instructs ${amt}. Bank 2 confirms the debit, AFC routes it, and the anchor accepts the funds on its reserve.`, .05, S => {
    S.check(B2, '', 0, 900);
    S.badge([[B2, 'ok']], '', 0);
    S.add({dur:900, start:() => { T.m.api += 2; }, run:p => { sI.set(H.x, lerp(H.y - H.r, space.busY, ease(p)), fade(p, .1, .9)); sC.set(B2.x, lerp(B2.y - B2.r, space.busY, ease(p)), fade(p, .1, .9)); space.glow(p > .85); },
      end:() => space.glow(false)});
    S.add({dur:1300, run:p => {
      const x0 = B2.x, y0 = B2.y - B2.r - 8, x1 = I.fromAnchor.x, y1 = I.fromAnchor.y + 16;
      const [x, y] = quad(x0, y0, (x0 + x1)/2, 150, x1, y1, ease(p));
      funds.set(x, y, p < .85 ? 1 : 1 - seg(p, .85, 1));
    }});
    S.check(I.fromAnchor, '', 0, 900);
    S.badge([[I.fromAnchor, 'ok']], '', 0);
  });

  // 3 of 5 · after acceptance the proof of transaction goes to NodeChain; AST issues ArosCoin 1 = 1
  beat(`3 of 5 · Issue. Only after acceptance, the proof of transaction goes to NodeChain (AST). AST issues ArosCoin 1 = 1 against the confirmed ${from} funds.`, .02, S => {
    S.add({dur:1100, start:() => { T.m.pot++; T.m.protoFee = true; }, run:p => {
      const [x, y] = quad(I.fromAnchor.x, I.fromAnchor.y, (I.fromAnchor.x + I.chain.x)/2, I.fromAnchor.y - 56, I.chain.x, I.chain.y, ease(p));
      pot.set(x, y, fade(p, .05, .9));
    }});
    S.badge([[I.chain, 'ok']], '', 0);
    S.add({dur:900, run:p => { aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)); ft.set(p); }});
  });

  // 4 of 5 · the payout anchor accepts ArosCoin and converts it 1 = 1; the payout reserve is checked
  beat(`4 of 5 · Accept and convert. The ${from} anchor accepts ArosCoin and converts it back into ${from}, 1 = 1. AFC checks the payout reserve.`, .02, S => {
    S.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true, dur:1200, arrive:() => aro.recur(from)});
    S.check(I.toAnchor, '', 0, 900);
    S.badge([[I.toAnchor, 'ok']], '', 0);
  });

  // 5 of 5 · the funds are booked on each bank's own books; the holding is told through the gateway; the process ends
  beat(`5 of 5 · Output. Bank 1 is credited ${amt} on its own books; Bank 2 has debited Sub B. The holding is notified through the gateway. The process ends.`, .05, S => {
    settleStep(T, S, I.toAnchor, B1, from, from, '', 0, 1100);
    S.check(B1, '', 0, 900);
    S.badge([[B1, 'ok']], '', 0);
    S.add({dur:700, run:p => { chips[0].set(cc(bal[0] + amount), 1, 'ok'); chips[1].set(cc(bal[1] - amount), 1, 'ok'); }});
    notify(T, S, space, H, '', 0);
    S.add({dur:300, end:() => { T.m.paid = 1; }});
  });

  T.rows = () => [R.api(T), ['Balances confirmed by banks', `${T.m.conf || 0} of ${n}`, false], ['Mandates in force', T.m.mand ? `${T.m.mand} of ${n}` : '—', false], ['Accounts held at AFC', 'none', false], ['Protocol fee (PoT)', T.m.protoFee ? 'tariff TBD' : '—', false]];
  T.extraSummary = () => [['Group position known after', 'minutes, from the banks’ own books'], ['Accounts held at AFC', 'none'], ['PoT fee (ArosCoin)', T.feesText()]];
  T.doneText = `Done. ${n} banks confirmed their own balances in one pass, the holding saw only what the mandates allow, and Bank 1 and Bank 2 each booked their own side. AFC held no accounts and no funds.`;
}

GOV.push({
  key:'gov-soe', no:'G11', group:'Government',
  name:'State-owned enterprise treasury', sub:'E-mailed balances vs mandated pass',
  inputs:[{id:'org', label:'Your holding', type:'text', def:'State Holding'},
          {id:'from', label:'Currency', type:'currency', def:'USD'},
          {id:'n', label:'Subsidiaries (2–5)', type:'number', def:3, min:2, max:5},
          {id:'amount', label:'Funding amount', type:'amount', def:2000000}],
  lede:'A holding with subsidiaries at several banks needs one view of cash and quick intra-group funding. Today balances come back by e-mail and PDF, are retyped by hand, and funding waits on paper and clearing batches. With AFC each bank confirms its own balance under a signed mandate and books its own side of the transfer.',
  note:'Illustrative model. Balances, days, cut-off times and amounts are examples, not quotes, service levels or statistics; in practice they vary by bank and by country. Each subsidiary keeps its accounts at its own bank. AFC opens no accounts, holds no balances and no funds, and is not a single point of control: the holding sees only the balances and evidence that each signed mandate permits, and any subsidiary or bank can revoke its mandate. The With-AFC track assumes the mandates are already in force; signing them takes the time the banks and subsidiaries need, and is not counted. It has no holds: each bank’s checks are shown on its own circle. It does not decide who may be funded; limits and approvals stay with the subsidiaries, their boards and the banks. Each bank posts the transfer on its own books under its own cut-off times, so the track shows the process, not the posting time. If AFC is unavailable, the banks and the holding fall back to today’s process. The protocol (PoT) fee is shown without an amount until its tariff is set. NodeChain belongs to AST.',
  today:{tag:'Today', title:'E-mails, a workbook and a paper order', vbH:468, unit:'h', build:g11Today},
  next:{tag:'With AFC', title:'Mandated balances, banks book locally', vbH:420, unit:'h', build:g11Afc}
});
