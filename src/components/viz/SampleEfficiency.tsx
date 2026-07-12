import React, { useState } from 'react';

// Measured (sample_efficiency.py / noisy_obs.py). Win % after training the
// controller on only K reward-labeled positions.
type Row = { k: string; scratch: number; jepa: number };
const CLEAN: Row[] = [
  { k: '40', scratch: 46, jepa: 29 },
  { k: '160', scratch: 9, jepa: 24 },
  { k: '640', scratch: 54, jepa: 65 },
  { k: 'all 1,590', scratch: 94, jepa: 92 },
];
const NOISY: Row[] = [
  { k: '40', scratch: 25, jepa: 24 },
  { k: '160', scratch: 32, jepa: 31 },
  { k: '640', scratch: 32, jepa: 29 },
  { k: 'all 1,590', scratch: 33, jepa: 35 },
];

const NOTES = {
  clean: 'The two runs wander inside seed noise and meet at the top. Pretraining saved no labels: nine clean integers are already a perfect state, so there was no better representation to discover.',
  noisy: 'Both stall near 33%. The noisy view was lossy (127 numbers crushed into 64), so nobody can recover the board. And the noise was mixed in linearly, which a plain network un-mixes on its own. No gap left for JEPA to fill.',
};

const W = 620, ROW_H = 58, PAD_L = 86, PAD_R = 30, PAD_T = 26, PAD_B = 34;

export default function SampleEfficiency() {
  const [mode, setMode] = useState<'clean' | 'noisy'>('clean');
  const rows = mode === 'clean' ? CLEAN : NOISY;
  const H = PAD_T + rows.length * ROW_H + PAD_B;
  const x = (v: number) => PAD_L + (v / 100) * (W - PAD_L - PAD_R);
  const y = (i: number) => PAD_T + i * ROW_H + ROW_H / 2;

  return (
    <figure className="fig">
      <div className="fig-title">Does JEPA pretraining save labeled games? No: the dots stay paired.</div>
      <div className="fig-sub">
        Win rate after training the controller on only K reward-labeled positions. If pretraining
        helped, the gold dot would sit far right of the gray one at small K.
      </div>

      <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.6rem' }}>
        <Toggle on={mode === 'clean'} onClick={() => setMode('clean')}>clean board</Toggle>
        <Toggle on={mode === 'noisy'} onClick={() => setMode('noisy')}>noisy 64-d view</Toggle>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }} role="img"
        aria-label="Paired dots comparing win rate of a network trained from scratch vs on the pretrained JEPA latent">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={PAD_T - 8} x2={x(v)} y2={H - PAD_B + 4} stroke="var(--border)" strokeWidth={1} />
            <text x={x(v)} y={H - PAD_B + 18} textAnchor="middle" style={{ fill: 'var(--muted)', font: '11px var(--sans)' }}>{v}%</text>
          </g>
        ))}
        {mode === 'clean' && (
          <g>
            <line x1={x(92)} y1={PAD_T - 8} x2={x(92)} y2={H - PAD_B + 4} stroke="var(--fg)" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.5} />
            <text x={x(92)} y={PAD_T - 12} textAnchor="middle" style={{ fill: 'var(--fg-soft)', font: '10.5px var(--sans)' }}>Q-table (92%)</text>
          </g>
        )}
        {rows.map((r, i) => {
          const lo = Math.min(r.scratch, r.jepa), hi = Math.max(r.scratch, r.jepa);
          return (
            <g key={r.k}>
              <text x={PAD_L - 12} y={y(i) - 5} textAnchor="end" style={{ fill: 'var(--fg-soft)', font: '600 12px var(--sans)' }}>K = {r.k}</text>
              <text x={PAD_L - 12} y={y(i) + 10} textAnchor="end" style={{ fill: 'var(--muted)', font: '10px var(--sans)' }}>labels</text>
              <line x1={x(lo)} y1={y(i)} x2={x(hi)} y2={y(i)} stroke="var(--border)" strokeWidth={3} strokeLinecap="round" />
              {/* from scratch: neutral */}
              <circle cx={x(r.scratch)} cy={y(i)} r={7} style={{ fill: 'var(--fg-soft)', stroke: 'var(--panel)', strokeWidth: 2 }}>
                <title>{`K=${r.k}, from scratch: ${r.scratch}% win`}</title>
              </circle>
              {/* JEPA-pretrained: accent */}
              <circle cx={x(r.jepa)} cy={y(i)} r={7} style={{ fill: 'var(--accent)', stroke: 'var(--panel)', strokeWidth: 2 }}>
                <title>{`K=${r.k}, JEPA pretrained: ${r.jepa}% win`}</title>
              </circle>
              <text x={x(r.scratch)} y={y(i) - 13} textAnchor="middle" style={{ fill: 'var(--fg-soft)', font: '600 11px var(--mono)' }}>{r.scratch}</text>
              <text x={x(r.jepa)} y={y(i) + 22} textAnchor="middle" style={{ fill: 'var(--accent)', font: '700 11px var(--mono)' }}>{r.jepa}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: '1.2rem', fontFamily: 'var(--sans)', fontSize: '.78rem', color: 'var(--muted)', marginTop: '.2rem' }}>
        <LegendDot color="var(--fg-soft)" label="plain network, from scratch" />
        <LegendDot color="var(--accent)" label="same network on the frozen JEPA latent" />
      </div>

      <div className="callout" style={{ marginTop: '1rem', marginBottom: 0 }}>{NOTES[mode]}</div>
    </figure>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
      <span style={{ width: 11, height: 11, borderRadius: 99, background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{
        cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.8rem', fontWeight: on ? 650 : 500,
        padding: '.35em .8em', borderRadius: 999,
        border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
        background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--panel)',
        color: on ? 'var(--accent)' : 'var(--fg-soft)',
      }}>
      {children}
    </button>
  );
}
