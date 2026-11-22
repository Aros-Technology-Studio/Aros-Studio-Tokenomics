/**
 * Decorative animated card art in the Starks manner: a ∞ hub with a
 * constellation, pulse rings, rotating dashed orbits or a network with a
 * travelling dot. Pure SVG + CSS (styles/starks.css); reduced-motion stops it.
 */
const CX = 180;
const CY = 75;

function Hub() {
  return (
    <>
      <circle className="oa-hub" cx={CX} cy={CY} r={24} />
      <text className="oa-mark" x={CX} y={CY + 8} textAnchor="middle">
        ∞
      </text>
    </>
  );
}

function Constellation() {
  const nodes: [number, number][] = [
    [62, 38],
    [118, 122],
    [292, 30],
    [328, 92],
    [250, 128],
    [84, 96],
  ];
  return (
    <>
      {[nodes[0], nodes[2], nodes[4]].map(([x, y]) => (
        <line key={`${x}-${y}`} className="oa-line" x1={CX} y1={CY} x2={x} y2={y} />
      ))}
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} className="oa-node" cx={x} cy={y} r={3.5} />
      ))}
      <Hub />
    </>
  );
}

function Pulse() {
  return (
    <>
      <circle className="oa-ring" cx={CX} cy={CY} r={26} />
      <circle className="oa-ring" cx={CX} cy={CY} r={26} />
      <circle className="oa-ring" cx={CX} cy={CY} r={26} />
      <circle className="oa-node" cx={92} cy={88} r={4} />
      <circle className="oa-node" cx={276} cy={52} r={3} />
      <Hub />
    </>
  );
}

function Orbits() {
  return (
    <>
      <g className="oa-orbit" stroke="url(#oa-grad)">
        <circle cx={CX} cy={CY} r={46} />
        <circle className="oa-node" cx={CX + 46} cy={CY} r={3.5} />
        <circle className="oa-node" cx={CX - 46} cy={CY} r={3.5} />
      </g>
      <g className="oa-orbit oa-orbit--rev" stroke="url(#oa-grad)">
        <circle cx={CX} cy={CY} r={66} />
        <circle className="oa-node" cx={CX} cy={CY - 66} r={3} />
      </g>
      <Hub />
    </>
  );
}

function Network() {
  const left = `M70,${CY + 40} C120,${CY + 40} 140,${CY + 10} ${CX - 24},${CY}`;
  const right = `M${CX + 24},${CY} C230,${CY + 30} 260,${CY + 40} 300,${CY + 40}`;
  return (
    <>
      <path className="oa-line" d={left} />
      <path className="oa-line" d={right} />
      <line className="oa-line" x1={70} y1={30} x2={130} y2={30} />
      <line className="oa-line" x1={250} y1={34} x2={300} y2={34} />
      <circle className="oa-node" cx={70} cy={CY + 40} r={4} />
      <circle className="oa-node" cx={300} cy={CY + 40} r={4} />
      <circle className="oa-node" cx={70} cy={30} r={3.5} />
      <circle className="oa-node" cx={300} cy={34} r={3.5} />
      <circle className="oa-runner" r={3.5} style={{ offsetPath: `path('${right}')` }} />
      <Hub />
    </>
  );
}

const VARIANTS = [Constellation, Pulse, Orbits, Network];

export function OrbitArt({ index = 0 }: { index?: number }) {
  const Variant = VARIANTS[index % VARIANTS.length];
  return (
    <svg className="orbit-art" viewBox="0 0 360 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="oa-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <Variant />
    </svg>
  );
}
