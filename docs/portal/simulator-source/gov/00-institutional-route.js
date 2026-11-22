// Each route follows one mandate. The step counter is not a settlement clock.
function institutionalScenario({key, no, group, name, mandate, assumption, source, today, next, outcome}) {
  function track(tag, events) {
    return {
      tag, title: name + ' · ' + tag, band: 'Event sequence', vbH: 350, unit: 'h',
      why: events[events.length - 1][1],
      build(T, K) {
        events.forEach(([label, caption], i) => {
          const x = 110 + 780 * i / (events.length - 1);
          const node = makeNode(T, {x, y: 160, r: 40, label, sub: String(i + 1)});
          K.pulse(node, caption, 0);
        });
        T.rows = () => [['Current event', events[Math.min(T.idx, events.length - 1)][0]]];
        T.summary = () => [['Completion evidence', outcome], ['Cost and duration', 'Not measured']];
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
