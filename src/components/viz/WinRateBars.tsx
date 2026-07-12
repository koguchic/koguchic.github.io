import React from 'react';
import { useInView } from './hooks';

export type Row = {
  label: string;
  win: number;   // 0..100
  draw: number;
  loss: number;
  note?: string;
  highlight?: boolean;
};

const seg = (v: number, color: string, t: number) => ({
  width: `${v * t}%`,
  background: `var(${color})`,
  transition: 'width .9s cubic-bezier(.2,.7,.2,1)',
});

/**
 * Stacked win / draw / loss bars, animated on scroll-in. The workhorse figure
 * used wherever we report a policy's outcome against the heuristic opponent.
 */
export default function WinRateBars({
  title,
  subtitle,
  rows,
  baseline,
}: {
  title?: string;
  subtitle?: string;
  rows: Row[];
  baseline?: number; // optional dashed reference line, in win %
}) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const t = seen ? 1 : 0;
  return (
    <figure className="fig" ref={ref}>
      {title && <div className="fig-title">{title}</div>}
      {subtitle && <div className="fig-sub">{subtitle}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
        {rows.map((r) => (
          <div key={r.label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--sans)',
                fontSize: '.82rem',
                marginBottom: '.28rem',
                color: r.highlight ? 'var(--accent)' : 'var(--fg-soft)',
                fontWeight: r.highlight ? 650 : 500,
              }}
            >
              <span>
                {r.label}
                {r.note && (
                  <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {r.note}</span>
                )}
              </span>
              <span className="mono" style={{ color: 'var(--good)' }}>{Math.round(r.win)}% win</span>
            </div>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                height: '1.5rem',
                borderRadius: 7,
                overflow: 'hidden',
                background: 'var(--bg-soft)',
                outline: r.highlight ? '2px solid var(--accent)' : 'none',
                outlineOffset: 2,
              }}
              title={`${r.win}% win · ${r.draw}% draw · ${r.loss}% loss`}
            >
              <div style={seg(r.win, '--good', t)} />
              <div style={seg(r.draw, '--draw', t)} />
              <div style={seg(r.loss, '--bad', t)} />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '1.1rem',
          marginTop: '.9rem',
          fontFamily: 'var(--sans)',
          fontSize: '.74rem',
          color: 'var(--muted)',
        }}
      >
        <Legend c="--good" label="win" />
        <Legend c="--draw" label="draw" />
        <Legend c="--bad" label="loss" />
        {baseline != null && <span>dashed = tabular Q ({baseline}% win)</span>}
      </div>
    </figure>
  );
}

function Legend({ c, label }: { c: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: `var(${c})` }} />
      {label}
    </span>
  );
}
