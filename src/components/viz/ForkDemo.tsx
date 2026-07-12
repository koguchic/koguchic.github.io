import React, { useState } from 'react';

// A real game line, verified against the exact solver (solve.py):
// X0 · O4(random) · X8 · O2(random) · X6 = fork {3,7} · O blocks 3 · X7 wins.
type Step = {
  board: number[];          // 1 = X, -1 = O, 0 = empty
  placed?: number;          // cell placed this step
  threats?: number[];       // cells where X wins next move
  lines?: number[][];       // board lines to draw (threat or win)
  winLine?: boolean;
  title: string;
  text: string;
};

const b = (cells: [number, number][]) => {
  const v = new Array(9).fill(0);
  for (const [i, m] of cells) v[i] = m;
  return v;
};

const STEPS: Step[] = [
  {
    board: b([[0, 1]]), placed: 0,
    title: 'X opens in a corner',
    text: 'Against this opponent the corner is the best opening (Q* = 0.93; the center is only 0.83).',
  },
  {
    board: b([[0, 1], [4, -1]]), placed: 4,
    title: 'O replies at random',
    text: 'X has no two-in-a-row, so there is nothing to block. O picks any empty cell, say the center.',
  },
  {
    board: b([[0, 1], [4, -1], [8, 1]]), placed: 8,
    title: 'X takes the opposite corner',
    text: 'Still no immediate threat (O holds the diagonal), so O will move randomly again.',
  },
  {
    board: b([[0, 1], [4, -1], [8, 1], [2, -1]]), placed: 2,
    title: 'O plays randomly again',
    text: 'The trap is set. Watch the bottom-left cell.',
  },
  {
    board: b([[0, 1], [4, -1], [8, 1], [2, -1], [6, 1]]), placed: 6,
    threats: [3, 7],
    lines: [[0, 3, 6], [6, 7, 8]],
    title: 'The fork',
    text: 'One move, two threats: the left column and the bottom row are each one X away. O can only block one of them.',
  },
  {
    board: b([[0, 1], [4, -1], [8, 1], [2, -1], [6, 1], [3, -1]]), placed: 3,
    threats: [7],
    lines: [[6, 7, 8]],
    title: 'O is forced to block. One of them.',
    text: 'The blocking rule fires, but a rule that blocks one threat is helpless against two.',
  },
  {
    board: b([[0, 1], [4, -1], [8, 1], [2, -1], [6, 1], [3, -1], [7, 1]]), placed: 7,
    lines: [[6, 7, 8]], winLine: true,
    title: 'X wins with the other',
    text: 'This is the entire exploit. Every method in this essay is just a different way of discovering this move sequence.',
  },
];

const CELL = 64, GAP = 6, PAD = 8;
const SZ = PAD * 2 + CELL * 3 + GAP * 2;
const cx = (i: number) => PAD + (i % 3) * (CELL + GAP) + CELL / 2;
const cy = (i: number) => PAD + Math.floor(i / 3) * (CELL + GAP) + CELL / 2;

export default function ForkDemo() {
  const [s, setS] = useState(0);
  const st = STEPS[s];
  const isFork = (st.threats?.length ?? 0) > 1;

  return (
    <figure className="fig">
      <div className="fig-title">How to beat the opponent, in one game</div>
      <div className="fig-sub">A real line of play, checked against the exact solver. Step through it.</div>

      <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <svg viewBox={`0 0 ${SZ} ${SZ}`} style={{ width: 'min(15rem, 100%)', flex: '0 0 auto' }} role="img"
          aria-label={st.title}>
          {Array.from({ length: 9 }, (_, i) => {
            const mark = st.board[i];
            const threat = st.threats?.includes(i);
            const justPlaced = st.placed === i;
            return (
              <g key={i}>
                <rect
                  x={cx(i) - CELL / 2} y={cy(i) - CELL / 2} width={CELL} height={CELL} rx={10}
                  style={{
                    fill: threat ? 'color-mix(in oklab, var(--accent) 18%, var(--bg-soft))' : 'var(--bg-soft)',
                    stroke: justPlaced ? 'var(--accent)' : 'var(--border)',
                    strokeWidth: justPlaced ? 2.5 : 1,
                  }}
                />
                {mark !== 0 && (
                  <text x={cx(i)} y={cy(i) + 1} textAnchor="middle" dominantBaseline="central"
                    style={{
                      font: '700 30px var(--sans)',
                      fill: mark === 1 ? 'var(--fg)' : 'var(--accent-2)',
                    }}>
                    {mark === 1 ? 'X' : 'O'}
                  </text>
                )}
                {mark === 0 && threat && (
                  <text x={cx(i)} y={cy(i) + 1} textAnchor="middle" dominantBaseline="central"
                    style={{ font: '600 15px var(--sans)', fill: 'var(--accent)' }}>
                    !
                  </text>
                )}
              </g>
            );
          })}
          {st.lines?.map((ln, k) => (
            <line key={k}
              x1={cx(ln[0])} y1={cy(ln[0])} x2={cx(ln[2])} y2={cy(ln[2])}
              style={{
                stroke: st.winLine ? 'var(--good)' : 'var(--accent)',
                strokeWidth: 5, strokeLinecap: 'round',
                opacity: st.winLine ? 0.9 : 0.55,
              }}
            />
          ))}
        </svg>

        <div style={{ flex: '1 1 14rem', fontFamily: 'var(--sans)', minWidth: '13rem' }}>
          <div style={{
            fontSize: '.78rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
            color: isFork ? 'var(--accent)' : st.winLine ? 'var(--good)' : 'var(--muted)', marginBottom: '.3rem',
          }}>
            move {s + 1} of {STEPS.length}{isFork ? ' · fork!' : st.winLine ? ' · win' : ''}
          </div>
          <div style={{ fontWeight: 650, fontSize: '1.05rem', marginBottom: '.35rem' }}>{st.title}</div>
          <div style={{ fontSize: '.9rem', color: 'var(--fg-soft)', lineHeight: 1.55 }}>{st.text}</div>

          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginTop: '1rem' }}>
            <NavBtn disabled={s === 0} onClick={() => setS(s - 1)}>← back</NavBtn>
            <NavBtn disabled={s === STEPS.length - 1} onClick={() => setS(s + 1)} primary>
              {s === STEPS.length - 1 ? 'done' : 'next →'}
            </NavBtn>
            <div style={{ display: 'flex', gap: 5, marginLeft: '.4rem' }}>
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setS(i)} aria-label={`step ${i + 1}`}
                  style={{
                    width: 9, height: 9, borderRadius: 99, padding: 0, cursor: 'pointer',
                    border: 'none',
                    background: i === s ? 'var(--accent)' : 'var(--border)',
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

function NavBtn({ children, onClick, disabled, primary }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        cursor: disabled ? 'default' : 'pointer', fontFamily: 'var(--sans)', fontSize: '.84rem', fontWeight: 600,
        padding: '.45em .95em', borderRadius: 9, opacity: disabled ? 0.4 : 1,
        border: `1px solid ${primary ? 'var(--accent)' : 'var(--border)'}`,
        background: primary ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'var(--panel)',
        color: primary ? 'var(--accent)' : 'var(--fg-soft)',
      }}>
      {children}
    </button>
  );
}
