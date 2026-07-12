import React, { useMemo, useState } from 'react';
import { useTween, lerp } from './hooks';

// deterministic gaussian-ish cloud so the figure is stable between renders
function makePoints(n: number) {
  let s = 20260711;
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const g = () => (rand() + rand() + rand() + rand() - 2) / 2; // ~N(0,·)
  return Array.from({ length: n }, () => {
    const x = 50 + g() * 26;
    const y = 50 + g() * 22;
    return { x, y, hue: (x * 0.6 + y * 0.4) }; // color carries "structure"
  });
}

export default function CollapseToggle() {
  const pts = useMemo(() => makePoints(150), []);
  const [collapsed, setCollapsed] = useState(false);
  const t = useTween(true, 700, collapsed ? 1 : 0);
  const k = collapsed ? t : 1 - t; // 0 = healthy, 1 = collapsed

  const variance = lerp(1.30, 0.002, k);
  const predLoss = lerp(0.208, 0.000, k);
  const probeR2 = lerp(0.124, 0.030, k);

  return (
    <figure className="fig">
      <div className="fig-title">Representation collapse: the trap</div>
      <div className="fig-sub">
        Toggle the anti-collapse regularizer. Watch the loss get <em>better</em> while the representation dies.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.05fr)', gap: '1.2rem', alignItems: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', aspectRatio: '1', background: 'var(--bg-soft)', borderRadius: 12 }}>
          <line x1="50" y1="6" x2="50" y2="94" stroke="var(--border)" strokeWidth="0.4" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="var(--border)" strokeWidth="0.4" />
          {pts.map((p, idx) => {
            const x = lerp(p.x, 50, k);
            const y = lerp(p.y, 50, k);
            const hue = 205 + (p.hue - 50) * 2.2; // blue→teal spread
            return (
              <circle key={idx} cx={x} cy={y} r={1.7}
                style={{ fill: `hsl(${hue} 70% 55%)`, opacity: 0.85 }} />
            );
          })}
          <text x="50" y="99" textAnchor="middle" style={{ fill: 'var(--muted)', font: '4px var(--sans)' }}>
            latent space (2 of 64 dims)
          </text>
        </svg>

        <div>
          <Meter label="latent variance" value={variance} max={1.4} good />
          <Meter label="prediction loss" value={predLoss} max={0.25} lowerIsBetter arrow />
          <Meter label="V*-probe R² (usefulness)" value={probeR2} max={0.14} good />
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              marginTop: '.9rem', width: '100%', cursor: 'pointer', fontFamily: 'var(--sans)',
              fontSize: '.85rem', fontWeight: 600, padding: '.6em', borderRadius: 10,
              border: `1px solid ${collapsed ? 'var(--bad)' : 'var(--accent)'}`,
              background: collapsed ? 'color-mix(in oklab, var(--bad) 12%, transparent)' : 'color-mix(in oklab, var(--accent) 12%, transparent)',
              color: collapsed ? 'var(--bad)' : 'var(--accent)',
            }}
          >
            anti-collapse regularizer: {collapsed ? 'OFF (collapsed)' : 'ON (healthy)'}
          </button>
        </div>
      </div>

      <div className="callout" style={{ marginBottom: 0, marginTop: '1.1rem' }}>
        With the regularizer <b>off</b>, the encoder maps every board to the <em>same point</em>.
        "Predict the next latent" becomes trivial, so the loss drops to <span className="mono">0.000</span>:
        a metric that looks <em>perfect</em> while the representation (R² ≈ 0) is worthless. A Q-table
        has no failure mode like this.
      </div>
    </figure>
  );
}

function Meter({ label, value, max, good, lowerIsBetter, arrow }: {
  label: string; value: number; max: number; good?: boolean; lowerIsBetter?: boolean; arrow?: boolean;
}) {
  const frac = Math.max(0, Math.min(1, value / max));
  const color = lowerIsBetter ? 'var(--bad)' : good ? 'var(--good)' : 'var(--accent)';
  return (
    <div style={{ marginBottom: '.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: '.78rem', color: 'var(--fg-soft)', marginBottom: '.2rem' }}>
        <span>{label} {arrow && <span style={{ color: 'var(--muted)' }}>(↓ looks better!)</span>}</span>
        <span className="mono" style={{ color }}>{value.toFixed(3)}</span>
      </div>
      <div style={{ height: '.55rem', background: 'var(--bg-soft)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${frac * 100}%`, height: '100%', background: color, transition: 'width .15s linear' }} />
      </div>
    </div>
  );
}
