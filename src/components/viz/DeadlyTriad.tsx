import React, { useEffect, useRef, useState } from 'react';

const N = 90;
const W = 560, H = 240, PAD = 34;

// two deterministic traces over N steps
function traces() {
  const table: number[] = [], approx: number[] = [];
  let w = 0.5;
  for (let k = 0; k < N; k++) {
    table.push(0.93 - 0.43 * Math.exp(-k / 12));        // converges, bounded
    w = w * 1.11 + 0.01;                                 // semi-gradient blow-up
    approx.push(w);
  }
  return { table, approx };
}
const CAP = 6; // y-axis top; anything above = "diverged"

export default function DeadlyTriad() {
  const { table, approx } = useRef(traces()).current;
  const [n, setN] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (!running) return;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 26) { last = t; setN((k) => (k >= N ? k : k + 1)); }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  useEffect(() => { if (n >= N) setRunning(false); }, [n]);

  const x = (i: number) => PAD + (i / (N - 1)) * (W - 2 * PAD);
  const y = (v: number) => H - PAD - (Math.min(v, CAP) / CAP) * (H - 2 * PAD);
  const path = (arr: number[]) => arr.slice(0, n).map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const diverged = n > 0 && approx[Math.min(n, N) - 1] >= CAP;

  return (
    <figure className="fig">
      <div className="fig-title">The deadly triad — swap the table for features and it blows up</div>
      <div className="fig-sub">Function approximation + bootstrapping + off-policy learning. Press run.</div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', background: 'var(--bg-soft)', borderRadius: 12 }}>
        {/* axes */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth={1} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth={1} />
        <text x={W - PAD} y={H - PAD + 18} textAnchor="end" style={{ fill: 'var(--muted)', font: '11px var(--sans)' }}>training steps →</text>
        <text x={PAD - 8} y={PAD + 4} textAnchor="end" style={{ fill: 'var(--muted)', font: '11px var(--sans)' }}>‖w‖</text>

        {/* traces */}
        <path d={path(table)} fill="none" stroke="var(--good)" strokeWidth={2.5} />
        <path d={path(approx)} fill="none" stroke="var(--bad)" strokeWidth={2.5} />

        {diverged && (
          <text x={W - PAD - 6} y={PAD + 16} textAnchor="end" style={{ fill: 'var(--bad)', font: '700 15px var(--mono)' }}>
            → ∞  (NaN)
          </text>
        )}
        {/* legend */}
        <g transform={`translate(${PAD + 10}, ${PAD + 4})`} style={{ font: '12px var(--sans)' }}>
          <rect x={0} y={-9} width={12} height={4} rx={2} style={{ fill: 'var(--good)' }} />
          <text x={18} y={-4} style={{ fill: 'var(--fg-soft)' }}>tabular Q (bounded)</text>
          <rect x={0} y={9} width={12} height={4} rx={2} style={{ fill: 'var(--bad)' }} />
          <text x={18} y={14} style={{ fill: 'var(--fg-soft)' }}>linear Q on latents (semi-gradient)</text>
        </g>
      </svg>

      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.9rem' }}>
        <button onClick={() => { if (n >= N) setN(0); setRunning(true); }}
          style={btn('var(--accent)')}>{running ? 'running…' : n >= N ? 'run again' : 'run'}</button>
        <button onClick={() => { setRunning(false); setN(0); }} style={btn('var(--border)', true)}>reset</button>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '.8rem', color: diverged ? 'var(--bad)' : 'var(--fg-soft)', alignSelf: 'center' }}>
          ‖w‖ = {n === 0 ? '—' : approx[Math.min(n, N) - 1] >= CAP ? 'NaN' : approx[Math.min(n, N) - 1].toFixed(2)}
        </span>
      </div>
      <div className="callout" style={{ marginTop: '1rem', marginBottom: 0 }}>
        The exact Q-table is unconditionally stable. The moment you approximate <span className="mono">Q(s,a)</span> with
        a function of learned features and bootstrap off it, a normal learning rate can send the weights to
        <span className="mono"> NaN</span>. (We use batch Fitted-Q-Iteration instead to get a stable — if still weak — number.)
      </div>
    </figure>
  );
}

const btn = (color: string, ghost = false): React.CSSProperties => ({
  cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.85rem', fontWeight: 600,
  padding: '.5em 1.1em', borderRadius: 9, border: `1px solid ${color}`,
  background: ghost ? 'var(--panel)' : 'color-mix(in oklab, var(--accent) 12%, transparent)',
  color: ghost ? 'var(--fg-soft)' : 'var(--accent)',
});
