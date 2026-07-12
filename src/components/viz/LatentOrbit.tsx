import React, { useEffect, useMemo, useRef, useState } from 'react';
import raw from '../../data/symmetry_latents.json';

type Mode = 'plain' | 'invariance' | 'equivariance';
const data = raw as unknown as {
  n: number;
  orbits: number[][];
  boards: number[][];      // base board (identity variant) of each orbit
  modes: Record<Mode, { points: number[][]; spreadRatio: number; regularity: number }>;
};

const LABELS: Record<Mode, { name: string; blurb: string }> = {
  plain: {
    name: 'plain JEPA',
    blurb: 'No symmetry term. The 8 versions of the same board land in unrelated corners of the space; the encoder never noticed they are the same game.',
  },
  invariance: {
    name: '+ invariance loss',
    blurb: '‖enc(s) − enc(Rs)‖² pulls all 8 onto one point. Great for value, but orientation is gone, so a policy can no longer say which cell to play. This encoder made play worse.',
  },
  equivariance: {
    name: '+ equivariance loss',
    blurb: '‖enc(Rs) − M_R·enc(s)‖² demands the code rotate along with the board. The 8 versions spread into a clean ring: related and still distinct. This is the symmetry a policy can use.',
  },
};

// The 8 symmetries, in the same order as dataset.py's SYMMETRIES.
const COORD_MAPS: Array<(r: number, c: number) => [number, number]> = [
  (r, c) => [r, c], (r, c) => [c, 2 - r], (r, c) => [2 - r, 2 - c], (r, c) => [2 - c, r],
  (r, c) => [r, 2 - c], (r, c) => [2 - r, c], (r, c) => [c, r], (r, c) => [2 - c, 2 - r],
];
const PERMS = COORD_MAPS.map((m) => {
  const p = new Array(9).fill(0);
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    const [nr, nc] = m(r, c);
    p[3 * nr + nc] = i;
  }
  return p;
});
const SYM_SHORT = ['id', '90°', '180°', '270°', '↔', '↕', '⤡', '⤢'];
const SYM_LONG = [
  'identity', 'rotated 90°', 'rotated 180°', 'rotated 270°',
  'flipped left–right', 'flipped up–down', 'transposed', 'anti-transposed',
];

export default function LatentOrbit() {
  const [mode, setMode] = useState<Mode>('plain');
  const [orbitIx, setOrbitIx] = useState(0);
  const [sel, setSel] = useState(0);            // which of the 8 symmetries is selected
  const [spin, setSpin] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rot = useRef({ yaw: 0.6, pitch: -0.35 });
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const screenPts = useRef<Array<{ sx: number; sy: number }>>([]);

  const orbit = data.orbits[orbitIx % data.orbits.length] ?? [];
  const baseBoard = data.boards?.[orbitIx % data.orbits.length] ?? new Array(9).fill(0);
  const md = data.modes[mode];
  const selBoard = useMemo(() => PERMS[sel].map((src) => baseBoard[src]), [sel, baseBoard]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888';

    const render = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (spin && !drag.current) rot.current.yaw += 0.0032;
      const { yaw, pitch } = rot.current;
      const ca = Math.cos(yaw), sa = Math.sin(yaw), cb = Math.cos(pitch), sb = Math.sin(pitch);
      const cx = w / 2, cy = h / 2, scale = Math.min(w, h) * 0.42;

      const pts = md.points;
      const proj = (p: number[]) => {
        const x1 = p[0] * ca + p[2] * sa, z1 = -p[0] * sa + p[2] * ca, y1 = p[1];
        const y2 = y1 * cb - z1 * sb, z2 = y1 * sb + z1 * cb;
        return { sx: cx + x1 * scale, sy: cy - y2 * scale, depth: z2 };
      };

      const accent = css('--accent');
      const accent2 = css('--accent-2');
      const panel = css('--panel');
      const faint = css('--muted');
      const ink = css('--fg');

      // background cloud, far-to-near
      const order = pts.map((_, i) => i).sort((a, b) => proj(pts[a]).depth - proj(pts[b]).depth);
      const inOrbit = new Set(orbit);
      for (const i of order) {
        if (inOrbit.has(i)) continue;
        const { sx, sy, depth } = proj(pts[i]);
        const t = (depth + 1) / 2;
        ctx.globalAlpha = 0.10 + 0.22 * t;
        ctx.fillStyle = faint;
        ctx.beginPath(); ctx.arc(sx, sy, 1.2 + 1.5 * t, 0, 7); ctx.fill();
      }

      // ---- the highlighted orbit ------------------------------------------
      const O = orbit.map((i) => proj(pts[i]));
      screenPts.current = O.map((p) => ({ sx: p.sx, sy: p.sy }));
      const cxo = O.reduce((s, p) => s + p.sx, 0) / (O.length || 1);
      const cyo = O.reduce((s, p) => s + p.sy, 0) / (O.length || 1);

      // spread on screen decides whether we can label individual points
      const rMax = Math.max(...O.map((p) => Math.hypot(p.sx - cxo, p.sy - cyo)));
      const collapsed = rMax < 14;

      // octagon outline: connect all 8 in angular order around the centroid,
      // so the outline is always a simple (non-self-crossing) polygon
      const ring = O.map((p, k) => ({ ...p, k, ang: Math.atan2(p.sy - cyo, p.sx - cxo) }))
        .sort((a, b) => a.ang - b.ang);
      if (!collapsed) {
        ctx.globalAlpha = 0.5; ctx.strokeStyle = accent; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ring.forEach((p, j) => (j ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy)));
        ctx.closePath(); ctx.stroke();
      }

      // points: rotations (0–3) filled, reflections (4–7) hollow; selected ringed
      O.forEach((p, k) => {
        const r = k === sel ? 6.5 : 5;
        ctx.globalAlpha = 1;
        if (k < 4) {
          ctx.fillStyle = accent;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, 7); ctx.fill();
          ctx.strokeStyle = panel; ctx.lineWidth = 1.5; ctx.stroke();
        } else {
          ctx.fillStyle = panel;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, 7); ctx.fill();
          ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke();
        }
        if (k === sel) {
          ctx.strokeStyle = accent2; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r + 3.5, 0, 7); ctx.stroke();
        }
      });

      // labels
      ctx.font = '600 10.5px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textBaseline = 'middle';
      if (collapsed) {
        ctx.textAlign = 'left';
        ctx.strokeStyle = panel; ctx.lineWidth = 3; ctx.fillStyle = ink;
        ctx.strokeText('all 8 → one point', cxo + 12, cyo);
        ctx.fillText('all 8 → one point', cxo + 12, cyo);
      } else {
        O.forEach((p, k) => {
          const dx = p.sx - cxo, dy = p.sy - cyo;
          const len = Math.hypot(dx, dy) || 1;
          const lx = p.sx + (dx / len) * 13, ly = p.sy + (dy / len) * 13;
          ctx.textAlign = dx < -8 ? 'right' : dx > 8 ? 'left' : 'center';
          ctx.strokeStyle = panel; ctx.lineWidth = 3;
          ctx.fillStyle = k === sel ? ink : faint;
          ctx.strokeText(SYM_SHORT[k], lx, ly);
          ctx.fillText(SYM_SHORT[k], lx, ly);
        });
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [mode, orbitIx, spin, orbit, md, sel]);

  // drag to rotate; a click (no movement) selects the nearest orbit point
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    rot.current.yaw += dx * 0.01;
    rot.current.pitch = Math.max(-1.4, Math.min(1.4, rot.current.pitch + dy * 0.01));
    drag.current = { x: e.clientX, y: e.clientY, moved: drag.current.moved };
  };
  const onUp = (e: React.PointerEvent) => {
    if (drag.current && !drag.current.moved && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let best = -1, bd = 18;
      screenPts.current.forEach((p, k) => {
        const d = Math.hypot(p.sx - mx, p.sy - my);
        if (d < bd) { bd = d; best = k; }
      });
      if (best >= 0) setSel(best);
    }
    drag.current = null;
  };

  const ratioTag =
    md.spreadRatio < 0.1 ? 'collapsed to a point'
      : md.regularity > 0.9 ? 'a clean, regular orbit'
      : 'scattered, unstructured';

  return (
    <figure className="fig">
      <div className="fig-title">Where the 8 versions of one board land in latent space</div>
      <div className="fig-sub">
        Every gray dot is one of the {data.n.toLocaleString()} positions (24-D latent, projected to 3-D; drag to rotate).
        The <b style={{ color: 'var(--accent)' }}>gold octagon</b> is a single board and its 8 rotations/reflections.
        Click a point to see that version of the board.
      </div>

      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.9rem' }}>
        {(['plain', 'invariance', 'equivariance'] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.8rem', fontWeight: mode === m ? 650 : 500,
              padding: '.35em .8em', borderRadius: 999,
              border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`,
              background: mode === m ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--panel)',
              color: mode === m ? 'var(--accent)' : 'var(--fg-soft)',
            }}>{LABELS[m].name}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
          style={{
            flex: '1 1 20rem', minWidth: '16rem', height: '340px',
            background: 'var(--bg-soft)', borderRadius: 12, touchAction: 'none', cursor: 'grab', display: 'block',
          }} />

        {/* the board being highlighted, in the selected orientation */}
        <div style={{
          flex: '0 0 auto', alignSelf: 'center', fontFamily: 'var(--sans)',
          display: 'flex', flexDirection: 'column', gap: '.5rem', alignItems: 'center',
        }}>
          <MiniBoard board={selBoard} />
          <div style={{ fontSize: '.78rem', color: 'var(--fg-soft)', textAlign: 'center', maxWidth: '9.5rem', lineHeight: 1.4 }}>
            <b style={{ color: 'var(--fg)' }}>{SYM_LONG[sel]}</b>
            <br />
            <span style={{ color: 'var(--muted)' }}>same game, {sel === 0 ? 'original view' : 'different view'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 4 }}>
            {SYM_SHORT.map((s, k) => (
              <button key={k} onClick={() => setSel(k)} title={SYM_LONG[k]}
                style={{
                  cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.68rem', fontWeight: sel === k ? 700 : 500,
                  padding: '.2em .45em', borderRadius: 6,
                  border: `1px solid ${sel === k ? 'var(--accent)' : 'var(--border)'}`,
                  background: sel === k ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'var(--panel)',
                  color: sel === k ? 'var(--accent)' : 'var(--fg-soft)',
                }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', margin: '.8rem 0 0', fontFamily: 'var(--sans)', fontSize: '.8rem' }}>
        <Stat label="orbit spread" value={md.spreadRatio.toFixed(3)} hint="0 = all rotations at one point" />
        <Stat label="orbit regularity" value={md.regularity.toFixed(2)} hint="1 = rotations evenly arranged, a real orbit" />
        <span style={{ alignSelf: 'center', color: 'var(--accent)', fontWeight: 600 }}>{ratioTag}</span>
        <span style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: '.72rem' }}>
          ● rotations&ensp;○ reflections
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.4rem' }}>
          <MiniBtn onClick={() => { setOrbitIx((i) => i + 1); setSel(0); }}>another board</MiniBtn>
          <MiniBtn onClick={() => setSpin((s) => !s)}>{spin ? 'pause' : 'spin'}</MiniBtn>
        </div>
      </div>

      <div className="callout" style={{ marginTop: '1rem', marginBottom: 0 }}>{LABELS[mode].blurb}</div>
    </figure>
  );
}

function MiniBoard({ board }: { board: number[] }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 2.2rem)', gridAutoRows: '2.2rem', gap: 3,
      padding: 6, background: 'var(--bg-soft)', borderRadius: 10, border: '1px solid var(--border)',
    }}>
      {board.map((v, i) => (
        <div key={i} style={{
          display: 'grid', placeItems: 'center', borderRadius: 6,
          background: 'var(--panel)', border: '1px solid var(--border)',
          fontFamily: 'var(--sans)', fontSize: '1.1rem', fontWeight: 700,
          color: v === 1 ? 'var(--fg)' : 'var(--accent-2)',
        }}>
          {v === 1 ? 'X' : v === -1 ? 'O' : ''}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <span title={hint} style={{ display: 'inline-flex', flexDirection: 'column' }}>
      <span style={{ color: 'var(--muted)', fontSize: '.72rem' }}>{label}</span>
      <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--fg)' }}>{value}</span>
    </span>
  );
}
function MiniBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '.76rem', padding: '.3em .7em',
      borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--fg-soft)',
    }}>{children}</button>
  );
}
