import React, { useMemo, useState } from 'react';

// Build the dihedral-group cell permutations (new[i] = old[perm[i]]), same as
// dataset.py's SYMMETRIES, computed in JS so there's nothing to transcribe wrong.
function buildPerms() {
  const maps: Array<(r: number, c: number) => [number, number]> = [
    (r, c) => [c, 2 - r],       // rotate 90° CW
    (r, c) => [r, 2 - c],       // reflect left–right
  ];
  return maps.map((m) => {
    const p = new Array(9).fill(0);
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      const [nr, nc] = m(r, c);
      p[3 * nr + nc] = i;
    }
    return p as number[];
  });
}

const BASE = [-1, 0, 0, 0, 0, 0, 0, 1, 0]; // O at 0, X at 7 — X to move
const BASE_OPT = 6;                         // unique optimal move (V* = +1.000)

export default function SymmetryExplorer() {
  const [rotCW, flipLR] = useMemo(buildPerms, []);
  const [board, setBoard] = useState<number[]>(BASE);
  const [opt, setOpt] = useState<number>(BASE_OPT);
  const [spin, setSpin] = useState(0);

  const apply = (perm: number[], deg: number) => {
    setBoard((b) => perm.map((src) => b[src]));
    setOpt((o) => perm.indexOf(o));
    setSpin((s) => s + deg);
  };
  const reset = () => { setBoard(BASE); setOpt(BASE_OPT); setSpin(0); };

  return (
    <figure className="fig">
      <div className="fig-title">Value is invariant; the best move is equivariant</div>
      <div className="fig-sub">
        Rotate or reflect the board. The <b style={{ color: 'var(--good)' }}>value</b> never
        moves, but the <b style={{ color: 'var(--accent)' }}>optimal move</b> spins with it.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 3.1rem)', gridAutoRows: '3.1rem',
            gap: 4, transition: 'transform .5s cubic-bezier(.4,1.3,.4,1)',
          }}
        >
          {board.map((v, i) => (
            <div key={i}
              style={{
                display: 'grid', placeItems: 'center', borderRadius: 9,
                background: i === opt ? 'color-mix(in oklab, var(--accent) 16%, var(--bg-soft))' : 'var(--bg-soft)',
                border: i === opt ? '2px solid var(--accent)' : '1px solid var(--border)',
                fontFamily: 'var(--sans)', fontSize: '1.7rem', fontWeight: 700,
                color: v === 1 ? 'var(--fg)' : v === -1 ? 'var(--accent-2)' : 'var(--accent)',
              }}
            >
              {v === 1 ? 'X' : v === -1 ? 'O' : i === opt ? <span style={{ opacity: .55, fontSize: '1.3rem' }}>✦</span> : ''}
            </div>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--sans)' }}>
          <Readout label="V*  (state value)" value="+1.000" tag="invariant ✓" tagColor="var(--good)" />
          <Readout label="optimal move" value={`cell ${opt}`} tag="equivariant ↻" tagColor="var(--accent)" mono />
          <div style={{ display: 'flex', gap: '.4rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Btn onClick={() => apply(rotCW, 90)}>rotate 90°</Btn>
            <Btn onClick={() => apply(flipLR, 0)}>reflect ↔</Btn>
            <Btn onClick={reset} ghost>reset</Btn>
          </div>
        </div>
      </div>

      <div className="callout" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
        This is why forcing the encoder to be rotation-<em>invariant</em> (collapse all
        rotations to one point) <b>hurt</b> play: it throws away the orientation the policy
        needs to name <em>which</em> cell to play. The value wants invariance; the policy
        wants equivariance. Getting that for free is exactly what the network could not do.
      </div>
    </figure>
  );
}

function Readout({ label, value, tag, tagColor, mono }: { label: string; value: string; tag: string; tagColor: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '.82rem', color: 'var(--fg-soft)', minWidth: '9rem' }}>{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: '1.15rem', fontWeight: 700 }}>{value}</span>
      <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: tagColor, fontWeight: 600 }}>{tag}</span>
    </div>
  );
}
function Btn({ onClick, children, ghost }: { onClick: () => void; children: React.ReactNode; ghost?: boolean }) {
  return (
    <button onClick={onClick}
      style={{
        cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.82rem', fontWeight: 600,
        padding: '.45em .9em', borderRadius: 9,
        border: `1px solid ${ghost ? 'var(--border)' : 'var(--accent)'}`,
        background: ghost ? 'var(--panel)' : 'color-mix(in oklab, var(--accent) 12%, transparent)',
        color: ghost ? 'var(--fg-soft)' : 'var(--accent)',
      }}
    >{children}</button>
  );
}
