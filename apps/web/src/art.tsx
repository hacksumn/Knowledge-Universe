import React, { useId } from 'react';
import type { ContinentId } from './catalogue';

// Original illustrated SVG art for each subject. Drawn on a 320×200 canvas and
// scaled with "slice" so it fills cards, hexes and the drawer header.

const stars: [number, number, number][] = [[22, 28, 1.2], [58, 170, .9], [292, 34, 1.1], [270, 168, .8], [140, 18, .7], [306, 110, .9], [16, 112, .8], [200, 186, .7]];

function Motif({ id, c }: { id: ContinentId; c: string }) {
  const line = { stroke: c, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'machine-learning': {
      const layers = [[60, 100, 140], [46, 82, 118, 154], [72, 128]].map((ys, i) => ys.map(y => [100 + i * 60, y] as const));
      return <g>
        {layers.slice(0, -1).flatMap((layer, i) => layer.flatMap(([x1, y1]) => layers[i + 1].map(([x2, y2]) => <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeOpacity=".35" strokeWidth="1.2" />)))}
        {layers.flat().map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i > 6 ? 10 : 8} fill="#0d1220" stroke={c} strokeWidth="2.4" />)}
        <circle cx="220" cy="72" r="4" fill={c} />
      </g>;
    }
    case 'agents':
      return <g>
        <circle cx="160" cy="100" r="54" {...line} strokeDasharray="6 7" strokeOpacity=".7" />
        <path d="M205 66 l9 -3 l-2 9" {...line} />
        <path d="M118 140 l-9 2 l2 -9" {...line} />
        <circle cx="160" cy="46" r="13" fill="#0d1220" stroke={c} strokeWidth="2.4" />
        <rect x="200" y="113" width="24" height="24" rx="5" fill="#0d1220" stroke={c} strokeWidth="2.4" />
        <path d="M100 126 l14 -24 l14 24z" fill="#0d1220" stroke={c} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M160 86 l12 14 l-12 14 l-12 -14z" fill={c} />
      </g>;
    case 'data-centers':
      return <g>
        {[0, 1, 2, 3].map(i => <g key={i} transform={`translate(${86 + i * 40} 42)`}>
          <rect width="30" height="118" rx="3" fill="#0d1220" stroke={c} strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5, 6].map(j => <g key={j}><line x1="5" x2="20" y1={12 + j * 15} y2={12 + j * 15} stroke={c} strokeOpacity=".45" strokeWidth="2" /><circle cx="24.5" cy={12 + j * 15} r="1.8" fill={c} opacity={(i + j) % 3 ? .45 : 1} /></g>)}
        </g>)}
        <line x1="70" x2="250" y1="164" y2="164" stroke={c} strokeOpacity=".5" strokeWidth="2" />
      </g>;
    case 'prediction-models':
      return <g>
        <path d="M70 150 L250 150 M70 150 L70 40" stroke={c} strokeOpacity=".4" strokeWidth="1.6" fill="none" />
        <path d="M75 128 C110 120 130 98 160 96 S220 64 248 48 L248 92 C220 104 196 120 160 124 S110 140 75 140z" fill={c} fillOpacity=".16" />
        <path d="M75 134 C110 128 130 106 160 110 S215 80 248 70" {...line} strokeWidth="2.6" />
        {[[95, 129], [130, 112], [160, 110], [196, 96], [226, 80]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill="#0d1220" stroke={c} strokeWidth="2" />)}
        <line x1="248" x2="248" y1="40" y2="150" stroke={c} strokeDasharray="3 5" strokeOpacity=".6" />
      </g>;
    case 'sports-gambling':
      return <g>
        <circle cx="128" cy="102" r="44" fill="#0d1220" stroke={c} strokeWidth="2.4" />
        <path d="M84 102 h88 M128 58 v88 M97 70 C112 86 112 118 97 134 M159 70 C144 86 144 118 159 134" {...line} strokeOpacity=".75" />
        <g transform="rotate(8 222 100)">
          <rect x="186" y="62" width="74" height="78" rx="6" fill="#0d1220" stroke={c} strokeWidth="2" />
          <line x1="197" x2="249" y1="80" y2="80" stroke={c} strokeOpacity=".7" strokeWidth="2" />
          <line x1="197" x2="235" y1="94" y2="94" stroke={c} strokeOpacity=".4" strokeWidth="2" />
          <line x1="197" x2="241" y1="106" y2="106" stroke={c} strokeOpacity=".4" strokeWidth="2" />
          <path d="M186 122 h74" stroke={c} strokeDasharray="3 4" strokeOpacity=".6" />
          <circle cx="245" cy="131" r="3" fill={c} />
        </g>
      </g>;
    case 'llms': {
      const widths = [[30, 44, 22, 38], [40, 26, 48, 20], [24, 36, 30]];
      return <g>
        {widths.map((row, r) => { let x = 82; return row.map((w, i) => { const el = <rect key={`${r}-${i}`} x={x} y={74 + r * 30} width={w} height="20" rx="5" fill={r === 2 && i === 2 ? c : '#0d1220'} stroke={c} strokeWidth="2" strokeOpacity={r === 2 && i === 2 ? 1 : .7} />; x += w + 8; return el; }); })}
        <path d="M97 70 C110 30 170 30 181 70 M143 70 C150 44 200 44 218 70" {...line} strokeOpacity=".55" strokeDasharray="4 5" />
        <path d="M236 134 l10 0" {...line} />
      </g>;
    }
    case 'ai-use-cases':
      return <g>
        {[0, 1, 2].flatMap(r => [0, 1, 2].map(col => <rect key={`${r}-${col}`} x={110 + col * 36} y={46 + r * 36} width="28" height="28" rx="6" fill={(r + col) % 2 ? '#0d1220' : c} fillOpacity={(r + col) % 2 ? 1 : .2 + r * .15} stroke={c} strokeWidth="2" />))}
        <path d="M236 52 l5 13 l13 5 l-13 5 l-5 13 l-5 -13 l-13 -5 l13 -5z" fill={c} />
        <path d="M80 150 C110 166 210 166 240 150" {...line} strokeOpacity=".45" strokeDasharray="4 6" />
      </g>;
    case 'pcb-diagnostics':
      return <g>
        <path d="M60 60 H120 V82 M60 140 H104 V118 M260 56 H210 V82 M260 146 H222 V118 M160 40 V76 M160 160 V124" {...line} strokeOpacity=".7" />
        {[[60, 60], [60, 140], [260, 56], [260, 146], [160, 40], [160, 160]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#0d1220" stroke={c} strokeWidth="2" />)}
        <rect x="118" y="76" width="84" height="48" rx="4" fill="#0d1220" stroke={c} strokeWidth="2.4" />
        {[0, 1, 2, 3, 4, 5].map(i => <g key={i}><line x1={128 + i * 13} x2={128 + i * 13} y1="70" y2="76" stroke={c} strokeWidth="2" /><line x1={128 + i * 13} x2={128 + i * 13} y1="124" y2="130" stroke={c} strokeWidth="2" /></g>)}
        <circle cx="132" cy="90" r="3" fill={c} />
      </g>;
  }
}

export function SubjectArt({ id, color, className }: { id: ContinentId; color: string; className?: string }) {
  const gid = useId().replace(/:/g, '');
  return <svg className={className} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
    <defs>
      <radialGradient id={`g${gid}`} cx="50%" cy="45%" r="75%">
        <stop offset="0" stopColor={color} stopOpacity=".32" />
        <stop offset=".55" stopColor={color} stopOpacity=".08" />
        <stop offset="1" stopColor="#0d1220" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="320" height="200" fill="#111729" />
    <rect width="320" height="200" fill={`url(#g${gid})`} />
    {stars.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#dfe6ff" opacity=".45" />)}
    <Motif id={id} c={color} />
  </svg>;
}
