import React from 'react';

/**
 * A board with exact Q*(s, a) painted onto every legal move: the Bellman
 * recursion's output, shown in place. Green = good for X, red = losing,
 * ring = the argmax (what a greedy policy plays). Values come from solve.py.
 *
 * The callout text lives here as presets because Astro MDX can't pass JSX
 * fragments as props into a React island.
 */
const CALLOUTS: Record<string, React.ReactNode> = {
  prefork: (
    <>
      The fork square is worth exactly <b>+1</b>. And two innocent-looking moves are worth{' '}
      <b>−1</b>: they threaten a win, which <em>forces</em> O to block on the anti-diagonal,
      where the block completes O's own line. Even in Tic-Tac-Toe, the right numbers are not obvious.
    </>
  ),
  opening: (
    <>
      Surprise: against a blocker, the <b>corner</b> is the best opening and the famous
      center is the <em>worst</em>, because corners lead to more forks. The game's value is{' '}
      <span className="mono">V* = 0.927</span>, which with ±1 rewards means P(win) − P(loss)
      under perfect play: about 94% wins, 5% draws, 1% losses.
    </>
  ),
};

export default function QBoard({
  title,
  sub,
  board,
  q,
  callout,
}: {
  title: string;
  sub?: string;
  board: number[];               // 1 = X, -1 = O, 0 = empty
  q: Record<number, number>;     // Q*(s,a) per legal cell
  callout?: string;              // key into CALLOUTS
}) {
  const vals = Object.values(q);
  const best = Math.max(...vals);
  const span = Math.max(...vals.map(Math.abs), 1e-9);

  const fill = (v: number) => {
    const t = Math.round(10 + 45 * (Math.abs(v) / span));
    return v >= 0
      ? `color-mix(in oklab, var(--good) ${t}%, var(--bg-soft))`
      : `color-mix(in oklab, var(--bad) ${t}%, var(--bg-soft))`;
  };
  const fmt = (v: number) =>
    (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2).replace(/^0/, '');

  const CELL = 62, GAP = 6, PAD = 6;
  const SZ = PAD * 2 + CELL * 3 + GAP * 2;
  const cx = (i: number) => PAD + (i % 3) * (CELL + GAP) + CELL / 2;
  const cy = (i: number) => PAD + Math.floor(i / 3) * (CELL + GAP) + CELL / 2;

  return (
    <figure className="fig">
      <div className="fig-title">{title}</div>
      {sub && <div className="fig-sub">{sub}</div>}

      <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <svg viewBox={`0 0 ${SZ} ${SZ}`} style={{ width: 'min(14.5rem, 100%)', flex: '0 0 auto' }} role="img" aria-label={title}>
          {Array.from({ length: 9 }, (_, i) => {
            const mark = board[i];
            const v = q[i];
            const isBest = v !== undefined && Math.abs(v - best) < 1e-9;
            return (
              <g key={i}>
                <rect x={cx(i) - CELL / 2} y={cy(i) - CELL / 2} width={CELL} height={CELL} rx={10}
                  style={{
                    fill: v !== undefined ? fill(v) : 'var(--bg-soft)',
                    stroke: isBest ? 'var(--fg)' : 'var(--border)',
                    strokeWidth: isBest ? 2.5 : 1,
                  }} />
                {mark !== 0 && (
                  <text x={cx(i)} y={cy(i) + 1} textAnchor="middle" dominantBaseline="central"
                    style={{ font: '700 28px var(--sans)', fill: mark === 1 ? 'var(--fg)' : 'var(--accent-2)' }}>
                    {mark === 1 ? 'X' : 'O'}
                  </text>
                )}
                {v !== undefined && (
                  <text x={cx(i)} y={cy(i) + (isBest ? -6 : 1)} textAnchor="middle" dominantBaseline="central"
                    style={{ font: `${isBest ? 700 : 500} 15px var(--mono)`, fill: 'var(--fg)' }}>
                    {fmt(v)}
                  </text>
                )}
                {v !== undefined && isBest && (
                  <text x={cx(i)} y={cy(i) + 14} textAnchor="middle" dominantBaseline="central"
                    style={{ font: '600 9.5px var(--sans)', letterSpacing: '.04em', fill: 'var(--fg-soft)' }}>
                    BEST
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {callout && CALLOUTS[callout] && (
          <div style={{ flex: '1 1 14rem', minWidth: '13rem', fontFamily: 'var(--sans)', fontSize: '.9rem', color: 'var(--fg-soft)', lineHeight: 1.55 }}>
            {CALLOUTS[callout]}
          </div>
        )}
      </div>
    </figure>
  );
}
