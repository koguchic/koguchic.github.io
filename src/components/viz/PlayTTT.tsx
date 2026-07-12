import React, { useEffect, useRef, useState } from 'react';
import policies from '../../data/policies.json';

// Play against the essay's three players. The blocker is implemented directly
// (it is one rule). The Q-table and JEPA agents are the real trained artifacts,
// exported as greedy-move lookups by tictactoe/jepa/export_policies.py.
type Mode = 'blocker' | 'qlearn' | 'jepa';
const POLICY = policies as { qlearn: Record<string, number>; jepa: Record<string, number> };

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const MODES: Record<Mode, { name: string; you: string; blurb: string }> = {
  blocker: {
    name: 'the blocker',
    you: 'You are X and move first.',
    blurb: 'The essay\'s opponent: it blocks your immediate threats and otherwise moves at random. It cannot be beaten without a fork. Find one.',
  },
  qlearn: {
    name: 'Q-table agent',
    you: 'You are O; the agent moves first.',
    blurb: 'The real trained Q-table (92% wins as X). It only knows positions it visited while training against the blocker. Play unlike the blocker and it goes off-book, marked with a ⚠, where the table has no opinion at all and falls back to a simple rule.',
  },
  jepa: {
    name: 'JEPA agent',
    you: 'You are O; the agent moves first.',
    blurb: 'The JEPA world model with its MLP-256 controller (also 92% as X). Unlike the table it has an answer for every board, but it only ever saw the blocker\'s replies. Whether its answers are any good out there is yours to discover.',
  },
};

const winnerOf = (b: number[]) => {
  for (const [i, j, k] of LINES) if (b[i] !== 0 && b[i] === b[j] && b[j] === b[k]) return { mark: b[i], line: [i, j, k] };
  return null;
};
const full = (b: number[]) => b.every((c) => c !== 0);
const empties = (b: number[]) => b.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);
const key = (b: number[]) => b.map((c) => (c === 1 ? 'X' : c === -1 ? 'O' : '.')).join('');
const winningCells = (b: number[], mark: number) =>
  empties(b).filter((c) => winnerOf(b.map((v, i) => (i === c ? mark : v))) !== null);

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// The blocker, verbatim from opponent.py: block a random immediate X threat, else random.
function blockerMove(b: number[]): number {
  const threats = winningCells(b, 1);
  return threats.length ? pick(threats) : pick(empties(b));
}

// Learned agents play X. Off-book fallback: take a win, block, else random.
function agentMove(b: number[], mode: 'qlearn' | 'jepa'): { cell: number; offBook: boolean } {
  const a = POLICY[mode][key(b)];
  if (a !== undefined && b[a] === 0) return { cell: a, offBook: false };
  const wins = winningCells(b, 1);
  if (wins.length) return { cell: pick(wins), offBook: true };
  const blocks = winningCells(b, -1);
  if (blocks.length) return { cell: pick(blocks), offBook: true };
  return { cell: pick(empties(b)), offBook: true };
}

const CELL = 64, GAP = 6, PAD = 8;
const SZ = PAD * 2 + CELL * 3 + GAP * 2;
const cx = (i: number) => PAD + (i % 3) * (CELL + GAP) + CELL / 2;
const cy = (i: number) => PAD + Math.floor(i / 3) * (CELL + GAP) + CELL / 2;

export default function PlayTTT({ defaultMode = 'blocker' }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [board, setBoard] = useState<number[]>(new Array(9).fill(0));
  const [turn, setTurn] = useState<number>(1);          // 1 = X, -1 = O
  const [offBook, setOffBook] = useState<Set<number>>(new Set());
  const [tally, setTally] = useState<Record<Mode, { w: number; d: number; l: number }>>({
    blocker: { w: 0, d: 0, l: 0 }, qlearn: { w: 0, d: 0, l: 0 }, jepa: { w: 0, d: 0, l: 0 },
  });
  const scored = useRef(false);

  const humanMark = mode === 'blocker' ? 1 : -1;
  const aiMark = -humanMark;
  const win = winnerOf(board);
  const over = win !== null || full(board);

  const reset = (m: Mode = mode) => {
    setBoard(new Array(9).fill(0));
    setTurn(1);
    setOffBook(new Set());
    scored.current = false;
  };
  const switchMode = (m: Mode) => { setMode(m); reset(m); };

  // score the finished game once
  useEffect(() => {
    if (!over || scored.current) return;
    scored.current = true;
    const res = win === null ? 'd' : win.mark === humanMark ? 'w' : 'l';
    setTally((t) => ({ ...t, [mode]: { ...t[mode], [res]: t[mode][res as 'w' | 'd' | 'l'] + 1 } }));
  }, [over, win, humanMark, mode]);

  // the machine's move, on its turn, after a beat
  useEffect(() => {
    if (over || turn !== aiMark) return;
    const id = setTimeout(() => {
      setBoard((b) => {
        if (winnerOf(b) || full(b)) return b;
        let cell: number;
        if (mode === 'blocker') {
          cell = blockerMove(b);
        } else {
          const mv = agentMove(b, mode);
          cell = mv.cell;
          if (mv.offBook) setOffBook((s) => new Set(s).add(cell));
        }
        return b.map((v, i) => (i === cell ? aiMark : v));
      });
      setTurn(humanMark);
    }, 380);
    return () => clearTimeout(id);
  }, [turn, over, aiMark, humanMark, mode, board]);

  const clickCell = (i: number) => {
    if (over || turn !== humanMark || board[i] !== 0) return;
    setBoard((b) => b.map((v, j) => (j === i ? humanMark : v)));
    setTurn(aiMark);
  };

  const status = over
    ? win === null ? 'Draw.'
      : win.mark === humanMark ? (mode === 'blocker' ? 'You win. That was a fork.' : 'You beat it!')
      : (mode === 'blocker' ? 'You lost to a half-random blocker. Try again.' : 'It got you.')
    : turn === humanMark ? `Your move (${humanMark === 1 ? 'X' : 'O'}).` : 'Thinking…';

  const t = tally[mode];

  return (
    <figure className="fig">
      <div className="fig-title">Play them yourself</div>
      <div className="fig-sub">{MODES[mode].you} The learned agents are the actual trained models, not scripts.</div>

      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)}
            style={{
              cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.8rem', fontWeight: mode === m ? 650 : 500,
              padding: '.35em .8em', borderRadius: 999,
              border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`,
              background: mode === m ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--panel)',
              color: mode === m ? 'var(--accent)' : 'var(--fg-soft)',
            }}>{MODES[m].name}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <svg viewBox={`0 0 ${SZ} ${SZ}`} style={{ width: 'min(15rem, 100%)', flex: '0 0 auto' }} role="img" aria-label="tic-tac-toe board">
          {Array.from({ length: 9 }, (_, i) => {
            const mark = board[i];
            const inWin = win?.line.includes(i);
            const clickable = !over && turn === humanMark && mark === 0;
            return (
              <g key={i} onClick={() => clickCell(i)} style={{ cursor: clickable ? 'pointer' : 'default' }}>
                <rect x={cx(i) - CELL / 2} y={cy(i) - CELL / 2} width={CELL} height={CELL} rx={10}
                  style={{
                    fill: inWin
                      ? `color-mix(in oklab, ${win!.mark === humanMark ? 'var(--good)' : 'var(--bad)'} 16%, var(--bg-soft))`
                      : 'var(--bg-soft)',
                    stroke: inWin ? (win!.mark === humanMark ? 'var(--good)' : 'var(--bad)') : 'var(--border)',
                    strokeWidth: inWin ? 2 : 1,
                  }} />
                {mark !== 0 && (
                  <text x={cx(i)} y={cy(i) + 1} textAnchor="middle" dominantBaseline="central"
                    style={{ font: '700 30px var(--sans)', fill: mark === 1 ? 'var(--fg)' : 'var(--accent-2)' }}>
                    {mark === 1 ? 'X' : 'O'}
                  </text>
                )}
                {offBook.has(i) && (
                  <text x={cx(i) + CELL / 2 - 10} y={cy(i) - CELL / 2 + 11} textAnchor="middle"
                    style={{ font: '11px var(--sans)' }}>⚠</text>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ flex: '1 1 14rem', minWidth: '13rem', fontFamily: 'var(--sans)' }}>
          <div style={{ fontWeight: 650, fontSize: '1.02rem', marginBottom: '.5rem', color: over ? (win === null ? 'var(--fg-soft)' : win.mark === humanMark ? 'var(--good)' : 'var(--bad)') : 'var(--fg)' }}>
            {status}
          </div>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '.8rem' }}>
            you vs {MODES[mode].name}:{' '}
            <span className="mono" style={{ color: 'var(--fg-soft)' }}>{t.w}W / {t.d}D / {t.l}L</span>
          </div>
          <button onClick={() => reset()}
            style={{
              cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.84rem', fontWeight: 600,
              padding: '.45em .95em', borderRadius: 9,
              border: '1px solid var(--accent)',
              background: 'color-mix(in oklab, var(--accent) 12%, transparent)', color: 'var(--accent)',
            }}>
            new game
          </button>
        </div>
      </div>

      <div className="callout" style={{ marginTop: '1rem', marginBottom: 0 }}>{MODES[mode].blurb}</div>
    </figure>
  );
}
