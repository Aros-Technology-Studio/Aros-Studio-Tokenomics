// Each route follows one mandate. Windows below are operational ranges, not SLA
// claims. AFC shortens the coordination/settlement segment; approvals,
// eligibility and asset-life events remain with their owners.
const INSTITUTIONAL_WINDOWS = {
  'gov-tax':       {today: '1–3 business days', next: 'same day–1 business day'},
  'gov-customs':   {today: 'minutes–1 business day', next: 'minutes–same day'},
  'gov-transfers': {today: '1–5 business days', next: 'same day–1 business day'},
  'gov-disaster':  {today: 'days–weeks', next: 'hours–1 business day after approval'},
  'gov-aid':       {today: 'weeks–months', next: 'days–weeks; programme checks remain'},
  'gov-cbdc':      {today: 'hours–2 business days', next: 'minutes–same day'},
  'gov-bonds':     {today: 'stage dates vary; coupon/redemption at maturity', next: 'stage dates vary; AST records confirmed events'},
  'gov-carbon':    {today: 'weeks–months', next: 'days–weeks; evidence gates remain'},
  'gov-soe':       {today: 'hours–2 business days', next: 'minutes–same day'},
  'gov-trade':     {today: '1–3 business days', next: 'same day–1 business day'}
};
function institutionalScenario({key, no, group, name, mandate, assumption, source, today, next, outcome}) {
  function track(tag, events) {
    const window = (INSTITUTIONAL_WINDOWS[key] || {})[tag === 'Today' ? 'today' : 'next'] || 'varies by institution and corridor';
    return {
      tag, title: name + ' · ' + tag, band: window, vbH: 350, unit: 'h',
      why: events[events.length - 1][1],
      build(T, K) {
        events.forEach(([label, caption], i) => {
          const x = 110 + 780 * i / (events.length - 1);
          const node = makeNode(T, {x, y: 160, r: 40, label, sub: String(i + 1)});
          K.pulse(node, caption, 0);
        });
        T.rows = () => [['Current event', events[Math.min(T.idx, events.length - 1)][0]]];
        T.summary = () => [['Completion evidence', outcome], ['Realistic operating window', window]];
        T.doneText = events[events.length - 1][1];
      }
    };
  }
  GOV.push({
    key, no, group, name, sub: outcome, inputs: [], lede: mandate,
    note: assumption + ' <a href="' + source + '" target="_blank" rel="noopener noreferrer">Baseline reference</a>',
    today: track('Today', today), next: track('With AFC', next)
  });
}
