/* ---------- app: one frame, one screen at a time (topics → details → route → play → result) ---------- */
const state = {scn:null, screen:'topics', side:null, playing:false, speed:1, vals:{}, sig:{}, results:{}, filter:'all'};
let cur = null;   // the single running Track
const SCREENS = ['topics','intro','route','play'];
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Why it went that way: shown in the result window. A scenario may set its own `why` on the route definition. */
const WHY = {
  payment:{
    today:'Funds travel hop by hop. Each intermediary holds them, screens the payment again and adds a fee, and the sender learns the outcome only when an acknowledgement travels all the way back.',
    next:'The sender’s bank clears its own compliance checks first. Then AFC runs one pass: every institution confirms its own account and liquidity at the same time. Money still moves on the institutions’ own books; AFC never holds it.'},
  lc:{
    today:'The guarantee is real, but the proof is paper. Documents are couriered and examined twice, so the importer’s funds stay blocked for as long as the paper takes.',
    next:'The LC terms become one machine-readable contract. When the carrier’s evidence arrives, both banks check it against the terms in one place. Banks keep their roles and their checks; AFC holds no funds and takes no credit risk.'},
  payroll:{
    today:'A batch is checked only when it reaches each beneficiary bank, after the money has left. A closed account turns into a return days later.',
    next:'Each beneficiary bank confirms its own account before anything moves, so a bad account is caught up front and the employer sees it at once. Banks still credit their customers on their own books.'}
};
const WHY_GENERIC = {
  today:'Each institution works from its own records and passes the case on by paper or message. Every hand-off adds a wait, a repeated check and a chance of error.',
  next:'The same institutions are connected through the AFC protocol layer. Each checks its own data once, at the same time, and the evidence is recorded. Authority and funds stay with the institutions; AFC coordinates the process and decides nothing.'
};
const whyOf = (s, side) => (s[side] && s[side].why) || (WHY[s.key] && WHY[s.key][side]) || WHY_GENERIC[side];

/* Currency options (every ISO 4217 code the browser knows), built once. */
let CUR_OPTS = null;
function currencyOptions(){
  if (CUR_OPTS) return CUR_OPTS;
  let codes = [];
  try { codes = Intl.supportedValuesOf('currency'); } catch { codes = Object.keys(RATES); }
  let names; try { names = new Intl.DisplayNames(['en'],{type:'currency'}); } catch { names = null; }
  const first = ['USD','EUR','GBP','CHF','JPY','CNY','AED','GEL'];
  const rest = codes.filter(c => !first.includes(c)).sort();
  const opt = c => `<option value="${c}">${c} — ${(names ? names.of(c) : c).replace(/</g,'&lt;')}</option>`;
  CUR_OPTS = `<optgroup label="Common">${first.map(opt).join('')}</optgroup><optgroup label="All currencies">${rest.map(opt).join('')}</optgroup>`;
  return CUR_OPTS;
}

/* ----- screens ----- */
function go(name){
  state.screen = name;
  SCREENS.forEach(n => { $('#scr-' + n).hidden = n !== name; });
  const el = $('#scr-' + name);
  el.classList.remove('enter'); void el.offsetWidth; el.classList.add('enter');
  $('#homeBtn').hidden = name === 'topics';
  closeResult(); $('#legendPop').hidden = true; $('#legendBtn').setAttribute('aria-expanded', 'false');
  renderCrumb();
  const f = el.querySelector('[data-focus]'); if (f) { try { f.focus({preventScroll:true}); } catch {} }
  if (el.scrollTop) el.scrollTop = 0;
}
function renderCrumb(){
  const host = $('#crumb'); host.replaceChildren();
  const s = state.scn, add = (t, on) => { const sp = document.createElement('span'); sp.textContent = t; if (on) sp.className = 'on'; host.appendChild(sp); };
  if (!s || state.screen === 'topics') { add('Choose a topic', true); return; }
  add(s.name, state.screen === 'intro');
  if (state.screen === 'route') add('Choose what to watch', true);
  if (state.screen === 'play') add(s[state.side].tag, true);
}

/* ----- screen 1 · topic cards ----- */
const MOTIF = {
  Government:'<svg class="card__motif" width="40" height="22" viewBox="0 0 40 22" aria-hidden="true"><path d="M3,8 L20,1.5 L37,8 Z M6,10 V19 M14,10 V19 M26,10 V19 M34,10 V19 M2,20.5 H38" fill="none" stroke="#9AA1AC" stroke-width="1.3"/></svg>',
  _:'<svg class="card__motif" width="40" height="22" viewBox="0 0 40 22" aria-hidden="true"><path d="M10,11 H30" stroke="#C3C8D0" stroke-width="1.3"/><g fill="none" stroke="#9AA1AC" stroke-width="1.4"><circle cx="8" cy="11" r="6"/><circle cx="32" cy="11" r="6"/></g></svg>'
};
function renderTopics(){
  const vis = SCENARIOS.filter(s => !s.hidden);
  const groups = [...new Set(vis.map(s => s.group || 'Scenarios'))];
  const count = g => vis.filter(s => (s.group || 'Scenarios') === g).length;
  const chips = $('#chips'); chips.replaceChildren();
  [['all', 'All', vis.length], ...groups.map(g => [g, g, count(g)])].forEach(([id, label, n]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', String(state.filter === id));
    b.append(label + ' ');
    const c = document.createElement('span'); c.textContent = String(n); b.appendChild(c);
    b.addEventListener('click', () => { state.filter = id; renderTopics(); });
    chips.appendChild(b);
  });
  const host = $('#cards'); host.replaceChildren();
  groups.filter(g => state.filter === 'all' || state.filter === g).forEach(g => {
    const lab = document.createElement('div'); lab.className = 'grouplabel'; lab.textContent = `${g} · ${count(g)} topic${count(g) > 1 ? 's' : ''}`;
    host.appendChild(lab);
    vis.filter(s => (s.group || 'Scenarios') === g).forEach(s => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'card'; b.dataset.key = s.key;
      b.innerHTML = `<span class="card__top"><span class="card__no"></span><span class="card__tr"></span></span>
        <span class="card__body"><span class="card__nm"></span><span class="card__sb"></span></span>`;
      b.querySelector('.card__no').textContent = s.no; b.querySelector('.card__nm').textContent = s.name; b.querySelector('.card__sb').textContent = s.sub;
      const r = state.results[s.key] || {}, tr = b.querySelector('.card__tr');
      if (r.today || r.next) {
        tr.className = 'card__tr card__done';
        if (r.today) { const i = document.createElement('i'); i.className = 't'; i.textContent = '✓'; i.title = 'Watched: Today'; tr.appendChild(i); }
        if (r.next) { const i = document.createElement('i'); i.className = 'n'; i.textContent = '✓'; i.title = 'Watched: ' + s.next.tag; tr.appendChild(i); }
      } else tr.innerHTML = MOTIF[g] || MOTIF._;
      b.addEventListener('click', () => openIntro(s, true));
      host.appendChild(b);
    });
  });
}
function showTopics(){
  stopRun(); state.scn = null;
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  $('#note').innerHTML = GENERIC_NOTE;
  renderTopics(); go('topics');
}

/* ----- screen 2 · topic + the viewer's own data ----- */
function renderSetup(){
  const s = state.scn, vals = state.vals[s.key] || {};
  const f = $('#setupForm'); f.replaceChildren();
  (s.inputs || []).forEach(inp => {
    const lab = document.createElement('label'); lab.className = 'field';
    const sp = document.createElement('span'); sp.textContent = inp.label; lab.appendChild(sp);
    let el;
    if (inp.type === 'currency') { el = document.createElement('select'); el.innerHTML = currencyOptions(); }
    else if (inp.type === 'select') { el = document.createElement('select'); inp.options.forEach(o => { const op = document.createElement('option'); op.value = o; op.textContent = o; el.appendChild(op); }); }
    else {
      el = document.createElement('input');
      if (inp.type === 'amount' || inp.type === 'number') { el.type = 'number'; el.min = inp.min ?? 1; if (inp.max) el.max = inp.max; el.step = inp.step ?? (inp.type === 'amount' ? 1000 : 1); }
      else { el.type = 'text'; el.maxLength = inp.maxLength || 26; el.spellcheck = false; }
    }
    el.id = 'in-' + inp.id; el.name = inp.id; el.value = vals[inp.id] ?? inp.def;
    lab.appendChild(el);
    if (inp.hint) { const h = document.createElement('small'); h.textContent = inp.hint; lab.appendChild(h); }
    f.appendChild(lab);
  });
}
function readSetup(){
  const s = state.scn, v = {};
  (s.inputs || []).forEach(inp => {
    const el = $('#in-' + inp.id); let x = el ? el.value : inp.def;
    if (inp.type === 'amount' || inp.type === 'number') { x = Number(x); if (!isFinite(x) || x < (inp.min ?? 1)) x = inp.def; if (inp.max) x = Math.min(inp.max, x); }
    else if (inp.type === 'text') { x = String(x || '').replace(/\s+/g, ' ').trim().slice(0, inp.maxLength || 26) || inp.def; }
    v[inp.id] = x;
  });
  state.vals[s.key] = v;
  // new details → earlier results no longer describe this run
  const sig = JSON.stringify(v);
  if (state.sig[s.key] !== sig) { delete state.results[s.key]; state.sig[s.key] = sig; }
  return v;
}
function cfg(){
  const v = state.vals[state.scn.key] || {};
  const from = v.from || 'USD';
  return {from, to: v.to || from, amount: Number(v.amount) || 1000000, v};
}
function openIntro(s, fromClick){
  stopRun(); state.scn = s;
  if (fromClick) { try { history.replaceState(null, '', '#' + s.key); } catch {} }
  $('#introNo').textContent = `${s.group || 'Topic'} · ${s.no}`;
  $('#introName').textContent = s.name;
  $('#introLede').textContent = s.lede;
  $('#introToday').textContent = s.today.title;
  $('#introNextTag').textContent = s.next.tag; $('#introNext').textContent = s.next.title;
  $('#note').innerHTML = s.note;
  renderSetup(); go('intro');
}

/* ----- screen 3 · Today or With AFC ----- */
function openRoute(){
  const s = state.scn; const v = readSetup();
  $('#rtTodayTitle').textContent = s.today.title;
  $('#rtNextTag').textContent = s.next.tag; $('#rtNextTitle').textContent = s.next.title;
  const r = state.results[s.key] || {};
  document.querySelectorAll('.route').forEach(b => b.classList.toggle('played', !!r[b.dataset.side]));
  const rd = $('#routeData'); rd.replaceChildren();
  rd.append('Your details: ');
  (s.inputs || []).filter(i => i.type !== 'currency' || i.id === 'from').slice(0, 4).forEach((inp, n) => {
    if (n) rd.append(' · ');
    const b = document.createElement('b'); b.textContent = inp.type === 'amount' ? money(v[inp.id], v.from || 'USD') : String(v[inp.id]); rd.appendChild(b);
  });
  go('route');
}

/* ----- screen 4 · play one route ----- */
function buildTrack(){
  const host = $('#panelHost'); host.replaceChildren();
  const s = state.scn;
  cur = new Track(state.side, s[state.side], host, cfg());
  cur.stored = false;
  $('#continueBtn').hidden = true; $('#continueBtn').textContent = 'Continue →';
  updatePlay();
}
function startPlay(side){
  readSetup();
  state.side = side; go('play');
  buildTrack(); state.playing = true; updatePlay();
}
function stopRun(){
  cur = null; state.playing = false; $('#panelHost').replaceChildren(); $('#continueBtn').hidden = true;
}
function updatePlay(){
  if (!cur) return;
  $('#playBtn').textContent = cur.done ? 'Replay' : (state.playing ? 'Pause' : 'Play');
}
function onDone(){
  cur.stored = true; state.playing = false;
  const s = state.scn, def = s[state.side];
  (state.results[s.key] = state.results[s.key] || {})[state.side] = {rows: cur.summary(), done: cur.doneText, tag: def.tag, title: def.title};
  $('#continueBtn').hidden = false; $('#continueBtn').focus({preventScroll:true});
  updatePlay();
}

/* ----- the translucent result window ----- */
function closeResult(){
  const ov = $('#overlay'); if (ov.hidden) return;
  ov.hidden = true;
  if (cur && cur.done) { $('#continueBtn').textContent = 'Show result →'; }
}
function showResult(){
  const s = state.scn, side = state.side, r = state.results[s.key] || {}, mine = r[side];
  if (!mine) return;
  const both = !!(r.today && r.next);
  const labels = [...new Set([].concat(...['today','next'].filter(k => r[k]).map(k => r[k].rows.map(x => x[0]))))];
  const val = (k, l) => ((r[k].rows.find(x => x[0] === l)) || [, '—'])[1];
  let head, body;
  if (both) {
    head = `<th>Measure</th><th>${esc(r.today.tag)}</th><th>${esc(r.next.tag)}</th>`;
    body = labels.map(l => `<tr><td>${esc(l)}</td><td class="t">${esc(val('today', l))}</td><td class="n">${esc(val('next', l))}</td></tr>`).join('');
  } else {
    head = `<th>Measure</th><th>${esc(mine.tag)}</th>`;
    body = labels.map(l => `<tr><td>${esc(l)}</td><td class="${side === 'today' ? 't' : 'n'}">${esc(val(side, l))}</td></tr>`).join('');
  }
  const prim = side === 'today' ? {id:'ovNext', t:`Next: ${s.next.tag} →`, go:() => startPlay('next')}
    : !r.today ? {id:'ovNext', t:'Next: how it runs today →', go:() => startPlay('today')}
    : {id:'ovTopics', t:'Choose another topic →', go:showTopics};
  const ov = $('#overlay');
  ov.innerHTML = `<div class="ov__card">
    <button type="button" class="ov__close" id="ovClose" aria-label="Close and look at the animation">×</button>
    <div class="ov__eyebrow"><span class="tag ${side}">${esc(mine.tag)}</span><span>${esc(s.name)} · result</span></div>
    <h3 id="ovTitle">${esc(mine.title)}</h3>
    <div class="ov__cols"><div><h4>What happened</h4><p>${esc(mine.done)}</p></div><div><h4>Why</h4><p>${esc(whyOf(s, side))}</p></div></div>
    <div><h4>${both ? 'Results, side by side' : 'Results'}</h4><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="ov__actions">
      <button type="button" class="btn" id="ovReplay">Replay</button>
      ${side === 'today' || !r.today ? '<button type="button" class="btn" id="ovTopics2">Choose another topic</button>' : ''}
      <button type="button" class="btn primary" id="${prim.id}">${esc(prim.t)}</button>
    </div></div>`;
  ov.hidden = false;
  $('#ovClose').addEventListener('click', closeResult);
  $('#ovReplay').addEventListener('click', () => { closeResult(); buildTrack(); state.playing = true; updatePlay(); });
  const t2 = $('#ovTopics2'); if (t2) t2.addEventListener('click', showTopics);
  $('#' + prim.id).addEventListener('click', prim.go);
  $('#' + prim.id).focus({preventScroll:true});
}

/* ----- loop ----- */
let last = performance.now();
function loop(now){
  const dt = Math.min(64, now - last) * state.speed; last = now;
  if (cur) {
    if (state.playing && !cur.paused) cur.advance(dt);
    cur.tick(now);
    if (cur.paused) { cur.paused = false; state.playing = false; updatePlay(); }
    if (cur.done && !cur.stored) onDone();
  }
  requestAnimationFrame(loop);
}
const GENERIC_NOTE = 'Illustrative model. Timings, fees and FX rates are examples, not quotes, service levels or performance claims. AFC is a logical process layer: it holds no funds, issues no money and is not a party to settlement; licensed institutions keep their roles, checks and decisions. NodeChain belongs to AST.';

/* ----- wiring ----- */
$('#homeBtn').addEventListener('click', showTopics);
$('#introBack').addEventListener('click', showTopics);
$('#introNextBtn').addEventListener('click', openRoute);
$('#setupForm').addEventListener('submit', e => { e.preventDefault(); openRoute(); });
$('#routeBack').addEventListener('click', () => go('intro'));
document.querySelectorAll('.route').forEach(b => b.addEventListener('click', () => startPlay(b.dataset.side)));
$('#speed').addEventListener('change', e => { state.speed = Number(e.target.value); });
$('#playBtn').addEventListener('click', () => {
  if (!cur) return;
  if (cur.done) { closeResult(); buildTrack(); state.playing = true; updatePlay(); return; }
  state.playing = !state.playing; cur.paused = false; updatePlay();
});
$('#stepBtn').addEventListener('click', () => {
  if (!cur) return;
  if (cur.done) { closeResult(); buildTrack(); }
  cur.paused = false; cur.stopAfterStep = !cur.done; state.playing = true; updatePlay();
});
$('#restartBtn').addEventListener('click', () => { if (!cur) return; closeResult(); buildTrack(); state.playing = true; updatePlay(); });
$('#continueBtn').addEventListener('click', showResult);
$('#legendBtn').addEventListener('click', () => {
  const p = $('#legendPop'); p.hidden = !p.hidden; $('#legendBtn').setAttribute('aria-expanded', String(!p.hidden));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeResult(); $('#legendPop').hidden = true; $('#legendBtn').setAttribute('aria-expanded', 'false'); return; }
  if (e.code === 'Space' && state.screen === 'play' && cur && !['INPUT','SELECT','BUTTON','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#playBtn').click(); }
});

renderTopics();
$('#note').innerHTML = GENERIC_NOTE;
renderCrumb();
const fromHash = SCENARIOS.find(s => !s.hidden && s.key === location.hash.slice(1));
if (fromHash) openIntro(fromHash, false);
requestAnimationFrame(loop);

// Embedded: tell the portal page how tall the content is, so its window fits without a second scrollbar.
if (document.documentElement.classList.contains('embed') && window.parent !== window) {
  const post = () => window.parent.postMessage({type:'aros-sim-height', h:Math.ceil(document.documentElement.scrollHeight)}, location.origin);
  try { new ResizeObserver(post).observe(document.body); } catch {}
  window.addEventListener('load', post); post();
}
