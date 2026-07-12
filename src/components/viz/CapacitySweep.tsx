import React, { useState } from 'react';

type Pt = { label: string; win: number; draw: number; loss: number; note: string };

// Measured (capacity.py). Sweep A: fixed 64-d JEPA latent, grow the control head.
const HEAD: Pt[] = [
  { label: 'linear', win: 36, draw: 24, loss: 40, note: "can't represent a fork — an XOR-like feature. Loses.", },
  { label: 'MLP-16', win: 44, draw: 56, loss: 0, note: 'enough to stop losing, not enough to win.' },
  { label: 'MLP-64', win: 85, draw: 15, loss: 0, note: 'now it can build forks.' },
  { label: 'MLP-256', win: 92, draw: 8, loss: 0, note: 'ties the 1,590-number table.' },
];
// Sweep C: fixed MLP-256 head, shrink the latent.
const LATENT: Pt[] = [
  { label: 'dim 2', win: 42, draw: 49, loss: 8, note: 'two numbers already beat random.' },
  { label: 'dim 4', win: 71, draw: 18, loss: 11, note: 'a lot of structure in four dims.' },
  { label: 'dim 8', win: 51, draw: 49, loss: 0, note: 'noisy — fork-separability is fragile here.' },
  { label: 'dim 16', win: 83, draw: 16, loss: 1, note: 'close.' },
  { label: 'dim 32', win: 92, draw: 8, loss: 0, note: 'optimal-level play.' },
];

export default function CapacitySweep() {
  const [mode, setMode] = useState<'head' | 'latent'>('head');
  const data = mode === 'head' ? HEAD : LATENT;
  const [i, setI] = useState(mode === 'head' ? 3 : 4);
  const cur = data[Math.min(i, data.length - 1)];

  const setModeSafe = (m: 'head' | 'latent') => {
    setMode(m);
    setI(m === 'head' ? 3 : 4);
  };

  return (
    <figure className="fig">
      <div className="fig-title">Was it the world model, or the controller?</div>
      <div className="fig-sub">
        Drag the slider. Everything is the <em>same</em> frozen JEPA latent — only the piece you vary changes.
      </div>

      <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.1rem', fontFamily: 'var(--sans)', fontSize: '.8rem' }}>
        <Toggle on={mode === 'head'} onClick={() => setModeSafe('head')}>grow the control head</Toggle>
        <Toggle on={mode === 'latent'} onClick={() => setModeSafe('latent')}>shrink the latent dim</Toggle>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', marginBottom: '.2rem' }}>
        <span className="mono" style={{ fontSize: '2.9rem', fontWeight: 700, color: winColor(cur.win), lineHeight: 1 }}>
          {cur.win}%
        </span>
        <span style={{ fontFamily: 'var(--sans)', color: 'var(--fg-soft)', fontSize: '.9rem' }}>win rate</span>
        <span className="mono" style={{ marginLeft: 'auto', fontFamily: 'var(--sans)', fontSize: '.85rem', color: 'var(--fg-soft)' }}>
          {mode === 'head' ? 'head = ' : 'latent = '}<b style={{ color: 'var(--accent)' }}>{cur.label}</b>
        </span>
      </div>

      {/* stacked bar */}
      <div style={{ position: 'relative', display: 'flex', height: '1.6rem', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-soft)', marginBottom: '.5rem' }}>
        <Bar v={cur.win} c="--good" />
        <Bar v={cur.draw} c="--draw" />
        <Bar v={cur.loss} c="--bad" />
        <Marker at={92} />
      </div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1.1rem' }}>
        dashed line = tabular Q-learning (92% win) · <span style={{ color: 'var(--good)' }}>win</span> ·{' '}
        <span style={{ color: 'var(--draw)' }}>draw</span> · <span style={{ color: 'var(--bad)' }}>loss</span>
      </div>

      <input
        type="range"
        min={0}
        max={data.length - 1}
        step={1}
        value={i}
        onChange={(e) => setI(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
        aria-label="capacity"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '.72rem', color: 'var(--muted)', marginTop: '.3rem' }}>
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>

      <div className="callout" style={{ marginTop: '1.1rem', marginBottom: 0 }}>
        <b style={{ fontFamily: 'var(--sans)' }}>{cur.label}:</b> {cur.note}
      </div>
    </figure>
  );
}

const Bar = ({ v, c }: { v: number; c: string }) => (
  <div style={{ width: `${v}%`, background: `var(${c})`, transition: 'width .35s ease' }} />
);
const Marker = ({ at }: { at: number }) => (
  <div style={{ position: 'absolute', left: `calc(${at}% )`, width: 0, height: '1.6rem', borderLeft: '2px dashed var(--fg)', opacity: .55 }} />
);
function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.8rem',
        padding: '.35em .8em', borderRadius: 999,
        border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
        background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--panel)',
        color: on ? 'var(--accent)' : 'var(--fg-soft)', fontWeight: on ? 600 : 500,
      }}
    >
      {children}
    </button>
  );
}
const winColor = (w: number) => (w >= 85 ? 'var(--good)' : w >= 55 ? 'var(--draw)' : 'var(--bad)');
