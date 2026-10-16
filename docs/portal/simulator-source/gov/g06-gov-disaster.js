/* ================= G06 · Disaster relief ================= */
// Today: pledges by letter, a grant agreement per donor, door-to-door paper forms, spreadsheets typed and merged by hand,
// a bank batch that waits for matching and clearing; households without ID are left off the list.
// With AFC: a contract agreed in advance is activated through the gateway; each institution checks its own data; the donor leg's
// anchor accepts the funds; then PoT and ArosCoin 1 = 1; the payout anchor pays out; no-ID cases get an in-person check and a cash-out.
function g06Vars(T){
  const v = T.cfg.v, {from, amount} = T.cfg;
  const n = Math.max(1, Math.min(6, Math.round(v.n || 5))), noid = Math.max(0, Math.min(n, Math.round(v.noid ?? 1)));
  return {org: v.org || 'National Relief Agency', region: v.region || 'North Valley', from, amount, n, noid, nId: n - noid, amt: money(amount, from)};
}
function g06Short(s, n=23){ return s.length > n ? s.slice(0, n - 1) + '…' : s; }
function g06Plural(k, one, many){ return k === 1 ? one : many; }
// One With-AFC step is one animation call. Its parts (checks, sparks, coins, notices) run back to back inside it,
// so the viewer's step counter matches the captions "n of 5".
function g06Beat(T, K, cap, sim, fill){
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
// The affected region: a dashed area with its name set on the top edge.
function g06Region(T, region, y1, y2){
  const L = T.layers.paths, label = `${region.toUpperCase()} · AFFECTED AREA`;
  svgEl('rect', {x:30, y:y1, width:940, height:y2 - y1, rx:16, fill:'#F6F8FA', stroke:C.muted, 'stroke-width':1.1, 'stroke-dasharray':'6 6'}, L);
  const bg = svgEl('rect', {x:44, y:y1 - 9, width:10, height:18, fill:'#FFFFFF'}, L);
  const t = svgEl('text', {x:54, y:y1 + 4.5, 'font-size':12, 'letter-spacing':1.6, 'font-weight':600, fill:C.muted}, L); t.textContent = label;
  let w = label.length*8.6; try { w = t.getComputedTextLength() || w; } catch {}
  bg.setAttribute('width', w + 20);
}
// Households in a row inside the region; the last `noid` of them have no ID document (Today track only).
function g06Homes(T, n, noid, y){
  const s = n > 1 ? Math.min(150, 730/(n - 1)) : 0, H = [];
  for (let i = 0; i < n; i++) {
    const x = 535 + (i - (n - 1)/2)*s, r = 28;
    const h = makeNode(T, {x, y, r, small:true, label:'', sub:''});
    const g = T.layers.nodes.lastElementChild, body = g.children[1];
    svgEl('path', {d:'M-12,-5 L0,-16 L12,-5', fill:'none', stroke:C.ink, 'stroke-width':1.7, 'stroke-linejoin':'round', 'stroke-linecap':'round'}, body);
    svgEl('path', {d:'M-8.5,-8 V3 H8.5 V-8', fill:'none', stroke:C.ink, 'stroke-width':1.6, 'stroke-linejoin':'round'}, body);
    svgEl('rect', {x:-2.2, y:-3, width:4.4, height:6, fill:C.ink}, body);
    h.grp = g; h.noid = i >= n - noid;
    if (h.noid) {
      h.tag = svgEl('text', {x:0, y:r + 16, 'text-anchor':'middle', 'font-size':11, 'letter-spacing':1.3, 'font-weight':700, fill:C.hold, opacity:0}, g);
      h.tag.textContent = 'NO ID';
    }
    H.push(h);
  }
  return H;
}
// One small coin stack from src to each household, staggered, along a path that bends from the source.
function g06Fan(T, K, src, list, cur, cap, sim, o={}){
  const k = list.length, st = k > 1 ? .3/(k - 1) : 0, sy = src.y + 16;
  const cs = list.map(() => makeCoins(T.layers.tokens, cur, 1, src.x, sy, 0));
  K.add({dur:o.dur || 1800, sim, cap, start:o.start, run:p => {
    list.forEach((b, i) => {
      const a = i*st, c = o.ctrl(b);
      const [x, y] = quad(src.x, sy, c[0], c[1], b.x, b.y + 12, ease(seg(p, a, a + .62)));
      cs[i].set(x, y, seg(p, a, a + .04));
    });
  }, end:o.end});
  return cs;
}

function g06Today(T, K){
  const {org, region, from, amount, n, noid, nId, amt} = g06Vars(T), Y = 200;
  g06Region(T, region, 330, 452);
  const D = makeNode(T, {x:130, y:Y, r:48, label:'Donors', sub:'Pledges'});
  const Ag = makeNode(T, {x:370, y:Y, r:48, label:org, sub:'Relief fund holder', lockAt:[-48, -73]});
  const LA = makeNode(T, {x:610, y:Y, r:48, label:'Local authority', sub:'Field office', hidden:true});
  const B = makeNode(T, {x:850, y:Y, r:48, label:'Paying bank', sub:'Batch payments', hidden:true});
  const H = g06Homes(T, n, noid, 394), withId = H.filter(h => !h.noid), noId = H.filter(h => h.noid);
  const fund = makeCoins(T.layers.tokens, from, 4, D.x, Y + 16, 0), tranche = makeCoins(T.layers.tokens, from, 3, D.x, Y + 16, 0);
  T.holdAmount = amount; T.m.hh = 0;

  // Pledges and agreements
  K.pulse(Ag, `A disaster hits ${region}. ${org} appeals for a ${amt} relief fund. ${n} affected ${g06Plural(n, 'household is', 'households are')} shown here.`);
  K.check(Ag, 'The agency’s board approves the appeal. Its finance team then drafts one pledge request for each donor.', 12);
  K.travel(Ag, D, makeDoc(T.layers.tokens, 'APPEAL'), 'The appeal goes out by e-mail and letter. Each donor reads it on its own schedule, with no shared system.', 24, {count:'docs'});
  K.check(D, 'Each donor checks its own mandate, budget line and emergency eligibility. This takes days to weeks and varies by donor.', 72, 2600);
  K.travel(D, Ag, makeDoc(T.layers.tokens, 'PLEDGE'), 'Donors pledge by letter. Each pledge carries its own conditions: reporting, currency, eligibility and a release schedule.', 96, {count:'docs', bend:50});
  K.check(Ag, `${org} signs a separate grant agreement with each donor. Each one sets its own reporting calendar and release rules.`, 72);
  K.travel(Ag, D, makeDoc(T.layers.tokens, 'COMPLIANCE'), 'The agency returns a compliance note: procurement, audit and beneficiary-feedback rules, attached to each agreement.', 12, {count:'docs', bend:50});
  K.coins(fund, D, Ag, 'The first pledged transfer arrives through the donor’s bank, in several parts over several days.', 48);
  K.hold(Ag, amt, 'The fund waits on the agency’s account. Nobody can be paid until an approved household list exists.', .25);

  // Paper registration in the affected area
  K.travel(Ag, LA, makeDoc(T.layers.tokens, 'LIST REQUEST'), `${org} asks the ${region} local authority for a list of affected households, by letter.`, 12, {count:'docs'});
  K.check(LA, 'The field office assigns teams to villages and camps. Transport and safe access set the pace: days to weeks.', 24);
  K.check([LA, ...H], 'Officials go door to door with paper forms: name, ID document, family size, phone. The forms are typed into spreadsheets later.', 168);
  K.add({dur:900, sim:0, cap: noid ? `${noid} ${g06Plural(noid, 'household has', 'households have')} no ID document. The form has no box for other proof, so ${g06Plural(noid, 'it cannot be registered and is', 'they cannot be registered and are')} left off.` : 'Every household shown has an ID document on its form, so every one can be registered.',
    run:p => H.forEach(h => { h.setBadge(p, h.noid ? 'fail' : 'ok'); h.setFlash(.5*Math.sin(Math.PI*p)); if (h.tag) h.tag.setAttribute('opacity', p); })});
  K.check(LA, 'A household without ID can ask the field office to re-check. The request is written on paper and waits for the next visit.', 72);
  K.stamp(LA, ['Households listed', 'Spreadsheet signed'], `The ${region} field office signs off the list.`, 24);
  K.check(LA, 'The district office checks the forms against the village lists. Missing forms go back to the field team by courier.', 48);

  // Spreadsheets, merge and approval by hand
  K.travel(LA, Ag, makeDoc(T.layers.tokens, 'SPREADSHEET'), 'The spreadsheet goes back to the agency by e-mail, one file per district.', 24, {count:'docs', bend:50});
  K.check(Ag, 'The agency merges the district files into one master sheet. Some fields are retyped by hand.', 48);
  K.check(Ag, 'Duplicates are removed by hand: the same family under two spellings, or two families with one phone number.', 48);
  K.stamp(Ag, ['Lists merged', 'Batch approved'], 'The finance team approves the payment batch. The approval is a signature on a printed sheet, then a file.', 24, g06Short(org));
  K.check(Ag, 'A second signatory checks the batch total against the signed sheet before the file leaves the agency.', 12);

  // The bank batch: a file, a release, matching, a clearing window
  K.travel(Ag, B, makeDoc(T.layers.tokens, 'BATCH FILE'), 'The approved batch goes to the paying bank as a file. The bank opens it on the next working day.', 24, {count:'docs', bend:-145});
  K.add({dur:1500, sim:24, cap:'The agency releases the fund to the paying bank for this batch. The bank books it on receipt.', run:p => {
    Ag.releaseLock(seg(p, 0, .35));
    const [x, y] = quad(Ag.x, Y + 16, 610, 50, B.x, Y + 16, ease(seg(p, .3, .95))); fund.set(x, y, 1);
  }, end:() => T.holdOff()});
  K.check(B, 'The bank matches the batch to accounts, record by record. A name or birth date that differs from the account is rejected.', 24);
  K.check(B, 'Matched payments wait for the clearing window, typically one working day. The money is already on the bank’s books: a queue, not a hold.', 24);
  K.badge([[B, 'fail']], 'Records that do not match come back as a file. The agency fixes each one by hand and sends a small second batch.', 24);
  K.travel(B, Ag, makeDoc(T.layers.tokens, 'QUERY'), 'The bank sends a query file for unclear records. The agency answers by phone, one record at a time.', 24, {count:'docs', bend:-110});

  // Payment to households with ID and an account; no path for the rest
  g06Fan(T, K, B, withId, from, nId ? `${nId} ${g06Plural(nId, 'household with an ID and an account is', 'households with an ID and an account are')} paid, weeks after the disaster.` : 'No household shown has an ID document, so no one here is paid.', 24,
    {ctrl:() => [B.x - 90, 445], start:() => fund.set(B.x, Y + 16, 0), end:() => { T.m.hh = nId; B.setBadge(1, 'ok'); }});
  if (noid) K.add({dur:1300, sim:0, cap:`The ${g06Plural(noid, 'household', 'households')} without ID ${g06Plural(noid, 'receives', 'receive')} nothing. Their re-check request is still in the paper queue at the field office.`,
    run:p => noId.forEach(h => { h.setFlash(.5*Math.sin(Math.PI*p)); h.tag.setAttribute('font-size', 11 + 1.5*ease(p)); })});

  // Reconciliation, report, and the donor's next tranche
  K.check(Ag, 'The agency reconciles the bank statement against its spreadsheet, line by line, by hand.', 96);
  K.check(Ag, 'Lines that do not match are chased by e-mail and phone. Some stay open for weeks.', 72);
  K.travel(Ag, D, makeDoc(T.layers.tokens, 'REPORT'), 'The agency sends a narrative report to donors weeks later, built from the same spreadsheets.', 168, {count:'docs', bend:50});
  K.hold(D, amt, 'The donor holds the next tranche until it reads and accepts the report. This is a real hold: the money has not moved.', 24);
  K.release(D, 'The report is accepted. The donor releases the next tranche.', 240);
  K.coins(tranche, D, Ag, 'The next tranche moves to the agency’s account, in several parts over several days.', 48);

  T.rows = () => [R.holds(T), R.onHold(T), R.holdTime(T), R.docs(T), ['Households paid', `${T.m.hh} of ${n}`, T.m.hh < n && T.m.hh === nId && noid > 0]];
  T.extraSummary = () => [['Households paid', `${nId} of ${n}`], ['Households without ID', noid ? 'left out' : 'none shown']];
  T.doneText = noid ? `Done. Households with papers were paid weeks after the disaster; ${noid} without ID received nothing.` : 'Done. The households were paid weeks after the disaster, after the list was typed, merged and batched.';
}

function g06Afc(T, K){
  const {org, region, from, n, noid, nId} = g06Vars(T);
  const acc = g06Plural(nId, 'account', 'accounts'), cases = g06Plural(noid, 'no-ID case', 'no-ID cases');
  // The AFC process space: anchors (one per fiat leg) and NodeChain inside the frame. AFC is not drawn; captions name it.
  const space = afcSpace(T, 'AFC · PROCESS SPACE', [
    ['fromAnchor', `Anchor · ${from}`, 'Donor leg'],
    ['chain', 'NodeChain', 'AST · PoT'],
    ['toAnchor', `Anchor · ${from}`, 'Payout leg']
  ]);
  const I = space.inside;
  // Outside the frame: institutions only, each reaching the process through the gateway. None is linked to an internal part or to another institution.
  const xs = [110, 320, 520, 720, 900], mk = (x, label, sub) => makeNode(T, {x, y:INST_Y, r:36, label, sub, lockAt:[70, -20]});
  const D = mk(xs[0], 'Donors', 'Committed funds');
  const Ag = mk(xs[1], org, 'Fund holder');
  const LA = mk(xs[2], 'Local authority', 'Field office');
  const B = mk(xs[3], 'Paying bank', 'Own books');
  const Ca = mk(xs[4], 'Cash-out agent', 'Licensed agent');
  space.connect([D, Ag, LA, B, Ca]);
  const funds = makeCoins(T.layers.tokens, from, 3, D.x, SPACE_GW, 0);
  const aro = makeCoins(T.layers.tokens, 'ARO', 3, I.chain.x, I.chain.y + 16, 0);
  const spark = space.sig();
  const ft = floatText(T.layers.fx, I.chain.x, I.chain.y - 40, '1 = 1', C.afc);
  T.m.hh = 0; T.m.fb = 0;

  // 1 of 5 · the request; each institution checks its own data; AFC routes the confirmed transfer to the donor leg
  g06Beat(T, K, `1 of 5 · Request. Each institution checks its own data: ${nId} ${acc}, ${noid} without ID. Through the gateway, AFC routes the confirmed transfer to the donor leg.`, .3, k => {
    k.api(Ag, space, '', 0);
    k.api(D, space, '', 0);
    k.add({dur:2400, run:p => {
      const a = Math.min(seg(p, 0, .15), 1 - seg(p, .85, 1));
      [D, LA, B].forEach(x => x.setRings(a));
      space.scan(p, a);
    }, end:() => [D, LA, B].forEach(x => x.setRings(0))});
    k.badge([[D, 'ok'], [LA, 'ok'], [B, 'ok']], '', 0);
  });

  // 2 of 5 · the donor-leg anchor accepts the funds on its own reserve; AFC checks them against the contract
  g06Beat(T, K, '2 of 5 · Accept. The donor-leg anchor accepts the funds on its own reserve. AFC checks the arrived funds against the contract.', .2, k => {
    k.coins(funds, D, I.fromAnchor, '', 0, {from:[D.x, SPACE_GW], fadeOut:true, dur:1200});
    k.check(I.fromAnchor, '', 0, 1000);
    k.badge([[I.fromAnchor, 'ok']], '', 0);
  });

  // 3 of 5 · only after acceptance: proof of transaction to NodeChain, then ArosCoin 1 = 1
  g06Beat(T, K, '3 of 5 · Issue. After acceptance, the proof of transaction is recorded in NodeChain (AST). Only then ArosCoin is issued 1 = 1.', .2, k => {
    k.add({dur:1000, start:() => { T.m.pot++; }, run:p => spark.set(lerp(I.fromAnchor.x, I.chain.x, ease(p)), I.chain.y, fade(p, .05, .9))});
    k.badge([[I.chain, 'ok']], '', 0);
    k.add({dur:1000, run:p => { aro.set(I.chain.x, I.chain.y + 16, seg(p, 0, .5)); ft.set(p); }});
  });

  // 4 of 5 · the payout anchor accepts ArosCoin and pays out from its reserve; the local authority checks no-ID cases in person
  g06Beat(T, K, noid
    ? `4 of 5 · Accept and convert. The payout anchor accepts ArosCoin and pays ${from}, 1 = 1. The ${region} local authority checks ${noid} ${cases} in person, over days.`
    : `4 of 5 · Accept and convert. The payout anchor accepts ArosCoin and pays ${from}, 1 = 1, with no conversion. No fallback check is needed this time.`,
    noid ? 72 : .5, k => {
    k.coins(aro, I.chain, I.toAnchor, '', 0, {fadeOut:true, dur:1100, arrive:() => aro.recur(from)});
    k.badge([[I.toAnchor, 'ok']], '', 0);
    if (noid) {
      k.add({dur:3000, run:p => LA.setRings(Math.min(seg(p, 0, .12), 1 - seg(p, .88, 1))), end:() => LA.setRings(0)});
      k.badge([[LA, 'ok']], '', 0);
    }
  });

  // 5 of 5 · output: the bank credits confirmed accounts, its cash-out agent pays signed cases, notices leave through the gateway
  const cap5 = noid && nId ? '5 of 5 · Output. The bank credits confirmed accounts. Its cash-out agent pays the signed no-ID cases in cash. Notices go out through the gateway.'
    : noid ? '5 of 5 · Output. The cash-out agent pays the signed no-ID cases in cash. Notices go out through the gateway.'
    : '5 of 5 · Output. The bank credits each confirmed account. Notices go out through the gateway.';
  g06Beat(T, K, cap5, 2, k => {
    settleStep(T, k, I.toAnchor, B, from, from, '', 0, 900);   // the paying bank's books are credited
    if (nId) {
      k.badge([[B, 'ok']], '', 0);
      k.add({dur:300, end:() => { T.m.hh = nId; }});
    }
    if (noid) {
      settleStep(T, k, B, Ca, from, from, '', 0, 900);         // the bank funds its cash-out agent on its own books
      k.check(Ca, '', 0, 1000);                                 // the agent checks the signed record before paying
      k.badge([[Ca, 'ok']], '', 0);
      k.add({dur:300, end:() => { T.m.fb = noid; }});
    }
    notify(T, k, space, D, '', 0);
    notify(T, k, space, Ag, '', 0);
  });

  T.rows = () => [R.api(T), ['Households paid', `${T.m.hh + T.m.fb} of ${n}`, false], ['Paid via fallback', String(T.m.fb), false], ['Token before acceptance', '0', false], ['Holds', 'none on this track', false]];
  T.extraSummary = () => [['Households paid', `${T.m.hh + T.m.fb} of ${n}`], ['Households without ID', noid ? 'paid in cash after a check' : 'none shown']];
  T.doneText = nId === 0
    ? `Done. No household shown has an ID and an account, so all ${n} were paid in cash after an in-person check.`
    : noid
      ? `Done. Households with accounts were paid once confirmed; ${noid} without ID ${g06Plural(noid, 'was', 'were')} paid in cash after an in-person check, against a signed record.`
      : 'Done. Every household shown was paid once its account was confirmed. No fallback was needed.';
}

GOV.push({
  key:'gov-disaster', no:'G06', group:'Government',
  name:'Disaster relief', sub:'Paper lists vs pre-agreed contract',
  inputs:[{id:'org', label:'Your agency', type:'text', def:'National Relief Agency'},
          {id:'region', label:'Affected region', type:'text', def:'North Valley'},
          {id:'from', label:'Currency', type:'currency', def:'USD'},
          {id:'amount', label:'Relief fund', type:'amount', def:2000000},
          {id:'n', label:'Households shown', type:'number', def:5, min:1, max:6},
          {id:'noid', label:'Of them without ID', type:'number', def:1, min:0, max:6, hint:'Cannot exceed households shown'}],
  lede:'Cash support after a disaster. Today pledges, paper lists and bank batches take weeks, and people without documents are left out. With AFC the relief contract is agreed in advance, each party checks its own data, and people without ID get an in-person fallback path.',
  note:'Illustrative model. Timings, household counts and amounts are examples, not service levels; the Today steps are typical and vary by country and by donor. The With-AFC track does not verify identity, decide eligibility or refuse anyone: the local authority and the agency decide on their own records, and a case that cannot be confirmed stays open for review. The in-person checks (days), the door-to-door registration and the cash-out stay with the institutions. AFC holds no funds: anchors hold their own reserves and each institution settles on its own books. ArosCoin is issued only after the transaction is confirmed. It does not make the donor, agency and bank systems atomic. No protocol fee is shown: its tariff is not set. NodeChain belongs to AST.',
  today:{tag:'Today', title:'Pledges, paper lists, a bank batch', vbH:460, unit:'h', build:g06Today},
  next:{tag:'With AFC', title:'Pre-agreed contract, fallback path', vbH:420, unit:'h', build:g06Afc}
});
