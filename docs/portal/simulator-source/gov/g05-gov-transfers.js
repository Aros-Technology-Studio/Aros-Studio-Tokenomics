/* ================= G05 · Intergovernmental (inter-budget) transfers ================= */
// Today: the ministry, the central bank, the regional treasuries and the municipalities work through paper, e-mail and letters. Money can sit unallocated until a region matches it by hand.
// With AFC: one signed policy version; each region confirms on its own books; the anchors accept and pay on their own reserves; one proof of transaction; the audit view reads the linked chain. Five steps.
function g05Xs(n, cx, span, maxStep){ if (n === 1) return [cx]; const st = Math.min(maxStep, span/(n - 1)); return Array.from({length:n}, (_, i) => cx + (i - (n - 1)/2)*st); }
function g05Fit(s, k){ return s.length > k ? s.slice(0, k - 1).trimEnd() + '…' : s; }
function g05Lock(v, cur){ const f = money(v, cur); if (f.length <= 12) return f; try { return new Intl.NumberFormat('en',{style:'currency', currency:cur, notation:'compact', maximumFractionDigits:1}).format(v); } catch { return f; } }
function g05N(v){ return Math.max(1, Math.min(5, Math.round(Number(v.n) || 3))); }
function g05Who(n, r1){ return `${n} region${n > 1 ? 's' : ''}${n > 1 ? `, ${r1} first` : ` (${r1})`}`; }
// Two municipalities under each region, grouped by a bracket with one label.
function g05Munis(T, regs, y, hidden){
  const L = svgEl('g', {opacity:hidden ? 0 : 1}, T.layers.paths), dots = [];
  regs.forEach(R => [-22, 22].forEach(dx => {
    const c = svgEl('circle',{cx:R.x + dx, cy:y, r:12, fill:'#FFFFFF', stroke:C.ink, 'stroke-width':1.3}, L);
    dots.push({x:R.x + dx, y, r:12, c, R});
  }));
  const x1 = dots[0].x - 12, x2 = dots[dots.length - 1].x + 12;
  svgEl('path',{d:`M${x1},${y + 20} v5 H${x2} v-5`, fill:'none', stroke:C.rail, 'stroke-width':1.2}, L);
  const t = svgEl('text',{x:(x1 + x2)/2, y:y + 41, 'text-anchor':'middle', 'font-size':11, 'letter-spacing':1.4, fill:C.muted}, L);
  t.textContent = 'MUNICIPALITIES · 2 PER REGION';
  dots.show = a => L.setAttribute('opacity', a);
  return dots;
}
function g05Paint(d, kind){ d.c.setAttribute('fill', kind === 'paid' ? '#E3F4EA' : '#FFFFFF'); d.c.setAttribute('stroke', kind === 'paid' ? C.ok : C.ink); }
// Several glyphs moving at once, edge to edge (fan-out / fan-in).
function g05Fly(T, K, legs, cap, sim, o = {}){
  const pts = legs.map(L => { const e = edge(L.a, L.b, o.off ?? 20); return [e[0], e[1], e[4], e[5]]; });
  K.add({dur:o.dur || 1700, sim, cap, start:() => { if (o.count) T.m[o.count] += legs.length; o.start && o.start(); }, run:p => {
    const e = ease(seg(p, 0, o.keep ? .85 : 1));
    legs.forEach((L, i) => {
      const [x1, y1, x2, y2] = pts[i];
      L.g.set(lerp(x1, x2, e), lerp(y1, y2, e) - (o.arc ?? 24)*Math.sin(Math.PI*e), o.keep ? seg(p, 0, .1) : fade(p));
    });
    o.run && o.run(p);
  }, end:() => o.end && o.end()});
}
// Polyline motion for one glyph; time is shared by segment length.
function g05Route(pts){
  const parts = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]); parts.push(d); tot += d; }
  return t => {
    let s = clamp(t)*tot;
    for (let i = 0; i < parts.length; i++) {
      if (s <= parts[i] || i === parts.length - 1) { const u = parts[i] ? clamp(s/parts[i]) : 1; return [lerp(pts[i][0], pts[i+1][0], u), lerp(pts[i][1], pts[i+1][1], u)]; }
      s -= parts[i];
    }
    return pts[pts.length - 1];
  };
}
// One visible AFC step made of several animation calls. Sub-steps run in order inside it.
function g05Beat(T, K, cap, sim, fill){
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

/* ---- Today: the real path, with the holds that are real and the waits that are not ---- */
function g05Today(T, K){
  const v = T.cfg.v, org = v.org || 'Ministry of Finance', r1 = v.region || 'Region 1', n = g05N(v);
  const {from, amount} = T.cfg, per = amount/n, amt = money(amount, from), perT = money(per, from);
  const D = (label, sealed) => makeDoc(T.layers.tokens, label, sealed);
  const E = label => makeEnvelope(T.layers.tokens, null, label);
  const nameL = n === 1 ? r1 : `Region ${n}`;
  T.holdAmount = per;

  const M = makeNode(T, {x:300, y:84, r:46, label:org, sub:'Pays transfers', stampAt:[-177, 0]});
  const CB = makeNode(T, {x:640, y:84, r:42, label:'Central bank', sub:'Payment system', hidden:true});
  const Au = makeNode(T, {x:910, y:84, r:42, label:'Audit office', sub:'To parliament', hidden:true});
  const regs = g05Xs(n, 500, 680, 230).map((x, i) => makeNode(T, {x, y:300, r:40, small:true, label:i === 0 ? g05Fit(r1, n >= 4 ? 14 : 18) : `Region ${i + 1}`, sub:'Treasury', hidden:true}));
  const Rl = regs[n - 1];
  const dots = g05Munis(T, regs, 424, true);
  const law = makeDoc(T.layers.tokens, 'BUDGET LAW'); law.set(50, 84, 1);
  const rc = regs.map(() => makeCoins(T.layers.tokens, from, 2, CB.x, CB.y + 16, 0));
  const mc = dots.map(() => makeCoins(T.layers.tokens, from, 1, 0, 0, 0));
  // landing points for summaries: a fan on the ministry's upper right, clear of its label and of the stamp card
  const land = i => { const th = (58 + 16*Math.min(i, 4))*Math.PI/180, rr = M.r + 40; return {x:M.x + rr*Math.sin(th), y:M.y + rr*Math.cos(th), r:0}; };
  // a letter that comes to rest beside a region (not under its label): the side the municipality sits on
  const side = (R, d) => ({x:R.x + Math.sign(d.x - R.x || 1)*56, y:R.y + 6, r:0});

  // 1 · the budget law sets the transfers
  K.add({dur:1700, sim:0, cap:`The budget law sets ${amt} in transfers to ${g05Who(n, r1)}. ${org} has to pay it out under the published conditions.`, start:() => T.m.docs++, run:p => {
    const e = ease(p); law.set(lerp(50, M.x - M.r - 22, e), 84 - 26*Math.sin(Math.PI*e), 1 - seg(p,.85,1)); M.bump = 1 + .05*seg(p,.8,1)*Math.sin(Math.PI*seg(p,.8,1));
  }});
  // 2 · the ministry splits the allocation by hand
  K.check(M, `${org}’s budget desk turns the law into a spreadsheet and splits the allocation by region. Formulas are checked by hand (illustrative: about a day).`, 24);
  // 3 · the transfer orders are signed on paper
  K.stamp(M, ['Allocations split', 'Orders signed'], 'The transfer orders are signed on paper by two officials. The paper signatures are the proof of approval.', 8, 'Ministry · orders');
  // 4 · the paper notices go out by post
  g05Fly(T, K, regs.map(R => ({a:M, b:R, g:D('NOTICE')})), 'A paper notice goes to each regional treasury by post or courier. Delivery takes days (illustrative).', 48, {count:'docs', run:p => { regs.forEach(R => R.setPresence(Math.max(R.presence, seg(p,.5,1)))); dots.show(ease(seg(p,.5,1))); }});
  // 5 · the same allocation by e-mail
  g05Fly(T, K, regs.map(R => ({a:M, b:R, g:E('E-MAIL')})), 'The same allocation also goes by e-mail as a spreadsheet. It is a working copy; the signed paper order is the reference.', 2, {count:'msgs', arc:40});
  // 6 · the regions log the paper
  K.check(regs, 'Each regional treasury logs the notice in a paper register and files the original. Nothing is entered in a system yet.', 8);
  // 7 · a phone call about a budget code
  K.pulse(regs[0], `The accountant in ${g05Fit(r1, 16)} phones the ministry about a budget code. The call is noted in a diary, not in a system.`, 4);
  // 8 · one payment file goes to the central bank
  K.travel(M, CB, D('PAYMENT FILE'), `${org} sends one payment file to the central bank. Orders received after the cut-off wait for the next payment run.`, 4, {count:'msgs'});
  // 9 · the central bank checks the file
  K.check(CB, 'The central bank checks the file format and the ministry’s balance. Clearing windows are set by the central bank and vary by country.', 6);
  // 10 · the queue until the clearing window
  K.check(CB, 'The payments wait in the clearing queue for the next window (illustrative: the next business day). This is a queue, not a hold.', 24, 2600);
  // 11 · the payment run reaches each region
  g05Fly(T, K, regs.map((R, i) => ({a:{x:CB.x, y:CB.y + 16, r:0}, b:{x:R.x, y:R.y + 16, r:0}, g:rc[i]})), `${perT} reaches each regional treasury in the payment run. The reference is a short code, not the notice number.`, 0, {keep:true, arc:56, off:0});
  // 12 · the money arrives unallocated: a real hold
  K.add({dur:900, sim:.5, cap:'The money arrives unallocated, with a short reference. Each region holds it in a suspense account until the notice is matched. This is a real hold: no one can spend it.', start:() => regs.forEach(() => T.holdOn()), run:p => regs.forEach(R => R.setLock(p, g05Lock(per, from)))});
  // 13 · each region matches the payment by hand
  K.check(regs, 'Each regional treasury matches the payment to its paper notice and its own budget line, by hand. Every region keeps its own ledger.', 72);
  // 14 · the last region cannot match
  K.badge(regs.map((R, i) => [R, i === n - 1 ? 'fail' : 'ok']), `${nameL} cannot match the payment to a budget line and keeps the money on hold. The other regions matched theirs.`, 2);
  // 15 · the matching regions release their money
  K.add({dur:900, sim:2, cap: n > 1 ? 'The regions that matched book the money to their budget lines and release it. Their holds end here.' : 'No region matched, so the one region keeps its money on hold.', run:p => regs.slice(0, -1).forEach(R => R.releaseLock(p)), end:() => regs.slice(0, -1).forEach(() => T.holdOff())});
  // 16 · the query letter
  K.travel(Rl, M, D('QUERY'), `${nameL} writes to the ministry by post, asking which budget line the payment belongs to. The letter takes days (illustrative).`, 48, {count:'docs', burn:false});
  // 17 · an e-mail copy, which does not count
  K.travel(Rl, M, E('COPY'), 'A copy goes by e-mail to speed things up. The ministry will not act on an e-mail copy; the paper original is needed.', 2, {count:'msgs', burn:false, bend:-60});
  // 18 · the ministry checks its own file
  K.check(M, `${org} looks up its spreadsheet and the paper annex. A budget-code typo in its own file is found by hand (illustrative: a day or two).`, 48, 2600);
  // 19 · the legal desk signs the reply
  K.check(M, 'The ministry’s legal desk signs the reply. The letter is the decision; the spreadsheet is not a legal document.', 24, 2600);
  // 20 · the reply by letter
  K.travel(M, Rl, D('REPLY'), `The ministry replies by letter. Only then can ${nameL} book the money.`, 48, {count:'docs', burn:false, bend:60});
  // 21 · the last region books the money and its hold ends
  K.add({dur:900, sim:2, cap:`${nameL} books the money to its budget line and releases the hold. It pays its municipalities from the next run.`, start:() => { Rl.setBadge(1, 'ok'); }, run:p => Rl.releaseLock(p), end:() => T.holdOff()});
  // 22 · each region pays its municipalities
  g05Fly(T, K, dots.map((d, i) => ({a:{x:d.R.x, y:d.R.y + 16, r:0}, b:{x:d.x, y:d.y + 4, r:0}, g:mc[i]})), 'Each region pays its municipalities in its own payment run. The spending itself is excluded from both clocks.', 24,
    {arc:0, off:0, start:() => rc.forEach((c, i) => c.set(regs[i].x, regs[i].y + 16, 0)), end:() => dots.forEach(d => g05Paint(d, 'paid'))});
  // 23 · the municipalities confirm receipt by letter
  g05Fly(T, K, dots.map(d => ({a:{x:d.x, y:d.y, r:12}, b:side(d.R, d), g:D('RECEIPT')})), 'Each municipality confirms receipt by letter to its region. The letter is paper and is filed by hand.', 48, {count:'docs', arc:0, off:0});
  // 24 · quarter-end paper use reports
  g05Fly(T, K, dots.map(d => ({a:{x:d.x, y:d.y, r:12}, b:side(d.R, d), g:D('USE REPORT')})), 'At quarter end, municipalities send paper use reports to their region. Reporting dates are set by the rules, which vary by country.', 120, {count:'docs', arc:0, off:0, run:p => regs.forEach(R => R.setFlash(.35*Math.sin(Math.PI*seg(p,.5,1))))});
  // 25 · reminders for missing reports
  g05Fly(T, K, dots.map(d => ({a:side(d.R, d), b:{x:d.x, y:d.y, r:12}, g:D('REMINDER')})), 'Where a report is missing, the region posts a paper reminder to the municipality (illustrative: days).', 72, {count:'docs', arc:0, off:0});
  // 26 · regions retype the reports
  K.check(regs, 'Regions retype the municipal reports into their own forms and summarise them by hand. Some reports arrive as scanned pages.', 120, 2600);
  // 27 · regional reconciliation
  K.check(regs, 'Each region reconciles its bank statement against its own ledger. Lines that do not match are chased by e-mail, one by one.', 48, 2600);
  // 28 · summaries reach the ministry in different formats
  g05Fly(T, K, regs.map((R, i) => ({a:{x:R.x, y:R.y - R.r - 26, r:0}, b:land(i), g:D(['PDF', 'SHEET', 'PAPER'][i % 3])})), 'Regional summaries reach the ministry in different formats: PDF, spreadsheet or paper. Some of them arrive late.', 72,
    {count:'docs', off:0, arc:0, end:() => M.setFlash(0), run:p => M.setFlash(.4*Math.sin(Math.PI*seg(p,.6,1)))});
  // 29 · the ministry consolidates by hand
  K.check(M, 'The ministry consolidates the summaries by hand. The totals do not tie out to the payments made. Differences are queried one by one.', 120, 3000);
  // 30 · month-end reconciliation with the central bank
  K.travel(M, CB, D('RECON'), 'At month end the ministry and the central bank reconcile their statements by hand. Differences are chased by e-mail (illustrative: days).', 168, {count:'msgs', burn:false, bend:-30});
  // 31 · the central bank's paper statement
  K.travel(CB, M, D('STATEMENT'), 'The central bank returns a paper statement. The ministry types the differences into its own file.', 48, {count:'docs', burn:false, bend:30});
  // 32 · the consolidated report goes to the audit office
  K.travel(M, Au, D('REPORT'), 'The consolidated report goes to the audit office, on paper and as a PDF. The audit office sits outside the payment chain.', 24, {count:'docs', bend:110});
  // 33 · the audit office asks each region for its statements
  g05Fly(T, K, regs.map(R => ({a:Au, b:R, g:D('REQUEST')})), 'The audit office asks each region for its bank statements and use reports, by letter. Each request takes days (illustrative).', 72, {count:'docs'});
  // 34 · the regions reply on paper
  g05Fly(T, K, regs.map(R => ({a:R, b:Au, g:D('PAPER')})), 'The regions reply by paper post. The statements arrive in different layouts, and some are photocopies.', 120, {count:'docs'});
  // 35 · the audit trace across three sets of books
  K.check(Au, 'The audit office tries to trace each payment to its use across three sets of books: ministry, regional and municipal. Each set is matched by hand.', 120, 3000);
  // 36 · the findings go to parliament, on paper
  K.add({dur:900, sim:48, cap:'The audit office sends its findings to parliament on paper. Parliament is not drawn here; its own timing is outside this model.', run:p => Au.setFlash(.3*Math.sin(Math.PI*p))});
  // 37 · part of the money cannot be traced
  const flag = floatText(T.layers.fx, Au.x, Au.y - Au.r - 4, 'open follow-ups', C.hold);
  K.add({dur:900, sim:0, cap:'Part of the money cannot be tied to a use report. The audit office opens follow-up requests, which go back to the regions by letter.', start:() => T.m.flagged++, run:p => { flag.set(p); Au.setFlash(.6*Math.sin(Math.PI*p)); }});

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), R.docs(T), ['Untraced at audit', T.m.flagged ? 'part of the funds' : '—', T.m.flagged > 0]];
  T.extraSummary = () => [['Audit trail', 'paper, partly traceable']];
  T.doneText = 'Done after weeks of letters and retyped reports (illustrative). The money arrived, but the audit office could not tie every payment to its use.';
}

/* ---- With AFC: one process in its own space; institutions outside it, reaching it only through the gateway ---- */
function g05Afc(T, K){
  const v = T.cfg.v, org = v.org || 'Ministry of Finance', r1 = v.region || 'Region 1', n = g05N(v);
  const {from, amount} = T.cfg, perT = money(amount/n, from), amt = money(amount, from);
  T.holdAmount = amount/n; T.m.g05conf = 0;
  // Inside the frame: a source anchor, NodeChain and a payout anchor. AFC is not drawn; it is named in the captions only.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Source leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${from}`, 'Payout leg']
  ]);
  const I = space.inside;
  // Institutions sit under the frame. Each reaches the gateway straight above it; none is linked to another.
  const gateAt = node => ({x:node.x, y:space.busY, r:0, presence:1, setPresence(){}});
  const M = makeNode(T, {x:110, y:INST_Y, r:50, label:g05Fit(org, 20), sub:'Pays transfers', lockAt:[70, -20]});
  const regs = (n === 1 ? [500] : Array.from({length:n}, (_, i) => 270 + i*460/(n - 1))).map((x, i) => makeNode(T, {x, y:INST_Y, r:38, small:true, label:i === 0 ? g05Fit(r1, n >= 4 ? 12 : 16) : `Region ${i + 1}`, sub:'Treasury', lockAt:[70, -20]}));
  const Au = makeNode(T, {x:900, y:INST_Y, r:42, small:true, label:'Audit office', sub:'Audit view', lockAt:[70, -20]});
  space.connect([M, ...regs, Au]);
  const funds = makeCoins(T.layers.tokens, from, 4, M.x, M.y + 16, 0);
  const env = makeEnvelope(T.layers.tokens, null, 'REQUEST');
  const aro = makeCoins(T.layers.tokens, 'ARO', 4, I.chain.x, I.chain.y + 16, 0);
  const pot = space.sig();
  const sparksR = regs.map(() => space.sig());
  // the funds leave the ministry's gateway column, run along the gateway strip and enter the source anchor from its right side
  const fundsRoute = g05Route([[M.x, SPACE_GW + 14], [230, SPACE_GW + 14], [230, I.fromAnchor.y], [I.fromAnchor.x + I.fromAnchor.r + 8, I.fromAnchor.y]]);

  // 1 of 5 · the request arrives through the gateway; the regions have confirmed on their own records
  g05Beat(T, K, `1 of 5 · Request. Regions confirm account, budget line and conditions version. AFC receives the request via the gateway and routes it to the source anchor.`, 2, k => {
    k.api(M, space, '', 0);
    k.onePass(regs, space, '', 0);
    k.add({dur:1100, start:() => { T.m.api += n; }, run:p => regs.forEach((R, i) => sparksR[i].set(R.x, lerp(R.y - R.r, SPACE_GW + 13, ease(p)), fade(p,.1,.9)))});
    k.badge(regs.map(R => [R, 'ok']), '', 0);
    k.add({dur:1600, start:() => { T.m.api++; }, run:p => {
      const e = ease(p);
      env.set(M.x, lerp(M.y - M.r - 6, SPACE_GW + 12, e), fade(p,.1,.88));
      funds.set(M.x, lerp(M.y + 16, SPACE_GW + 14, e), seg(p,0,.08));
      space.glow(p > .6);
    }});
  });
  // 2 of 5 · the source anchor accepts the funds on its reserve account
  g05Beat(T, K, `2 of 5 · Accept. The ${from} anchor accepts the funds on its reserve account. AFC checks them against the request. AFC holds no funds; the anchor does.`, .5, k => {
    k.add({dur:1900, run:p => { const [x, y] = fundsRoute(ease(p)); funds.set(x, y, Math.min(seg(p,0,.04), 1 - seg(p,.9,1))); }});
    k.badge([[I.fromAnchor, 'ok']], '', 0);
  });
  // 3 of 5 · after acceptance the proof is recorded in NodeChain and ArosCoin is issued 1 = 1
  g05Beat(T, K, '3 of 5 · Issue. After acceptance, the proof of transaction is recorded in NodeChain (AST). ArosCoin is issued 1 = 1 against the confirmed funds.', .5, k => {
    k.add({dur:1400, start:() => { T.m.pot++; }, run:p => { const q = seg(p, 0, .75); pot.set(lerp(I.fromAnchor.x + 28, I.chain.x - 28, ease(q)), I.chain.y, fade(q, .04, .8)); }});
    k.add({dur:700, run:p => aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .8))});
  });
  // 4 of 5 · the payout anchor accepts ArosCoin and converts it 1 = 1
  g05Beat(T, K, `4 of 5 · Accept and convert. The payout anchor accepts ArosCoin and converts it 1 = 1 into ${from}. Both legs use one currency, so no rate applies.`, .5, k => {
    k.coins(aro, I.chain, I.toAnchor, '', 0, {arrive:() => aro.recur(from), fadeOut:true});
    k.badge([[I.toAnchor, 'ok']], '', 0);
  });
  // 5 of 5 · each region is credited on its own books and confirms receipt; the audit view reads the chain
  g05Beat(T, K, '5 of 5 · Output. Each region is credited on its own books and confirms receipt. The audit view reads the linked chain. The process ends.', 24, k => {
    regs.forEach(R => settleStep(T, k, I.toAnchor, R, from, from, '', 0, 1000));
    k.add({dur:1100, start:() => { T.m.api += n; }, run:p => regs.forEach((R, i) => sparksR[i].set(R.x, lerp(R.y - R.r, SPACE_GW + 13, ease(p)), fade(p,.1,.9))), end:() => { T.m.g05conf = n; }});
    k.badge(regs.map(R => [R, 'ok']), '', 0);
    k.pulse(I.chain, '', 0);
    notify(T, k, space, M, '', 0);
    k.api(Au, space, '', 0);
    k.check(Au, '', 0, 2200);
    k.badge([[Au, 'ok']], '', 0);
  });

  T.rows = () => [['Holds', 'none on this track', false], ['Proof of transaction', String(T.m.pot), false], ['Token before acceptance', '0', false], ['API calls', String(T.m.api), false], ['Receipts confirmed', `${T.m.g05conf} / ${n}`, false]];
  T.extraSummary = () => [['Audit trail', 'linked evidence chain']];
  T.doneText = `Done in about a day (illustrative). The conditions were signed once, each region checked them on its own books, and ${perT} per region is linked by reference to its receipt.`;
}

GOV.push({
  key:'gov-transfers', no:'G05', group:'Government',
  name:'Inter-budget transfers', sub:'Paper cascade vs one signed contract',
  inputs:[ {id:'org', label:'Your ministry', type:'text', def:'Ministry of Finance'},
           {id:'from', label:'Currency', type:'currency', def:'EUR'},
           {id:'amount', label:'Transfer amount', type:'amount', def:60000000, max:100000000000},
           {id:'n', label:'Regions', type:'number', def:3, min:1, max:5},
           {id:'region', label:'First region', type:'text', def:'Northern Region'} ],
  lede:'A ministry of finance pays budget transfers to regions, which pay their municipalities. Today the notices, the money and the paper reports travel separately, and a payment can sit unallocated until someone matches it by hand. With AFC, one signed, versioned contract links each payment, receipt and use report.',
  note:'Illustrative model. Waits and timings are examples, not service levels or measurements. Budget procedures, notice formats and reporting dates vary by country; the Today track shows one typical path, not a rule. Transfer conditions are set by law and by the responsible ministry. AFC publishes them as a signed policy version; any change needs a new signed version. The With AFC track does not decide allocations, does not read the budget law, and does not show a region whose budget line fails: a mismatch is found on that region’s own records before the request is sent, and the review belongs to the region and the ministry. It does not draw municipalities as separate circles or show their use reports; those are filed through each region as spending happens, where the conditions allow, and sit outside this clock. AFC is a logical process layer: it holds no funds, the anchors hold their own reserves, and each institution settles on its own books. Institutions are linked by evidence, not by one joint transaction. Audit conclusions stay with the audit office and parliament. PoT is recorded only where the law allows. ArosCoin is issued only after acceptance and moves only inside the frame; the payment itself settles on the institutions’ own books. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Paper notices and unallocated money', vbH:470, unit:'h', build:g05Today},
  next:{tag:'With AFC', title:'One signed contract, one evidence trail', vbH:420, unit:'h', build:g05Afc}
});
