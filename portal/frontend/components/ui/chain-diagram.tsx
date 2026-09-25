/**
 * Animated chain diagram — ported from the design artifact.
 * Draws once its wrapping .reveal gets the `.in` class (see theme.css `.reveal.in .chain-*`).
 */
export function ChainDiagram() {
  const nodes = [
    { cx: 70, cy: 100, r: 13, fill: '#8fb6ff', delay: '.2s', label: 'process' },
    { cx: 260, cy: 100, r: 13, fill: '#a9a6ff', delay: '.6s', label: 'proof · PoT' },
    { cx: 450, cy: 100, r: 15, fill: '#c69bff', delay: '1s', label: 'mint' },
    { cx: 640, cy: 100, r: 13, fill: '#a6d8ff', delay: '1.4s', label: 'commission' },
    { cx: 830, cy: 100, r: 13, fill: '#8affc8', delay: '1.8s', label: 'reserve' },
  ];

  return (
    <div className="chain-wrap">
      <svg
        className="chain-svg"
        viewBox="0 0 900 200"
        role="img"
        aria-label="A chain of five linked records: process, proof, mint, commission, reserve."
      >
        <defs>
          {/* userSpaceOnUse: objectBoundingBox degenerates on this path's zero-height bbox */}
          <linearGradient id="cg" gradientUnits="userSpaceOnUse" x1={70} y1={100} x2={830} y2={100}>
            <stop offset="0" stopColor="#8fb6ff" />
            <stop offset=".5" stopColor="#c69bff" />
            <stop offset="1" stopColor="#8affc8" />
          </linearGradient>
          {/* userSpaceOnUse region: avoids the filter collapsing to zero on the
              perfectly horizontal line, whose bbox has zero height */}
          <filter id="chain-glow" filterUnits="userSpaceOnUse" x={-20} y={-20} width={940} height={240}>
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="chain-line" d="M70,100 H830" pathLength={1} filter="url(#chain-glow)" />
        <g>
          {nodes.map((n) => (
            <circle
              key={n.label}
              className="chain-node"
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={n.fill}
              filter="url(#chain-glow)"
              style={{ animationDelay: n.delay }}
            />
          ))}
        </g>
        <g textAnchor="middle">
          {nodes.map((n) => (
            <text
              key={n.label}
              className="chain-label"
              x={n.cx}
              y={150}
              style={{ animationDelay: `calc(${n.delay} + .2s)` }}
            >
              {n.label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
