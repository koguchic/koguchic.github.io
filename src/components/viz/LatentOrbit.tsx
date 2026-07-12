import React, { useEffect, useRef, useState } from 'react';
import raw from '../../data/symmetry_latents.json';

type Mode = 'plain' | 'invariance' | 'equivariance';
const data = raw as unknown as {
  n: number;
  orbits: number[][];
  modes: Record<Mode, { points: number[][]; spreadRatio: number; regularity: number }>;
};

const LABELS: Record<Mode, { name: string; blurb: string }> = {
  plain: {
    name: 'plain JEPA',
    blurb: 'No symmetry term. The 8 rotations of a board land in unrelated places — the encoder never noticed they are the same game.',
  },
  invariance: {
    name: '+ invariance loss',
    blurb: '‖enc(s) − enc(Rs)‖². The 8 rotations collapse onto one point. Great for value, but orientation is gone, so a policy can no longer tell which cell to play.',
  },
  equivariance: {
    name: '+ equivariance loss',
    blurb: '‖enc(Rs) − M_R·enc(s)‖², learning how each rotation acts on the latent. The 8 rotations spread into a structured orbit: symmetry encoded, orientation kept.',
  },
};

export default function LatentOrbit() {
  const [mode, setMode] = useState<Mode>('plain');
  const [orbitIx, setOrbitIx] = useState(0);
  const [spin, setSpin] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rot = useRef({ yaw: 0.6, pitch: -0.35 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const orbit = data.orbits[orbitIx % data.orbits.length] ?? [];
  const md = data.modes[mode];

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

      if (spin && !drag.current) rot.current.yaw += 0.0035;
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
      const faint = css('--muted');

      // background cloud, far-to-near
      const order = pts.map((_, i) => i).sort((a, b) => proj(pts[a]).depth - proj(pts[b]).depth);
      const inOrbit = new Set(orbit);
      for (const i of order) {
        if (inOrbit.has(i)) continue;
        const { sx, sy, depth } = proj(pts[i]);
        const t = (depth + 1) / 2;
        ctx.globalAlpha = 0.12 + 0.28 * t;
        ctx.fillStyle = faint;
        ctx.beginPath(); ctx.arc(sx, sy, 1.3 + 1.6 * t, 0, 7); ctx.fill();
      }

      // the highlighted orbit: rotation 4-cycle as a ring, all 8 as dots, star to centroid
      const O = orbit.map((i) => proj(pts[i]));
      const cxo = O.reduce((s, p) => s + p.sx, 0) / (O.length || 1);
      const cyo = O.reduce((s, p) => s + p.sy, 0) / (O.length || 1);
      ctx.globalAlpha = 0.28; ctx.strokeStyle = accent; ctx.lineWidth = 1;
      for (const p of O) { ctx.beginPath(); ctx.moveTo(cxo, cyo); ctx.lineTo(p.sx, p.sy); ctx.stroke(); }
      ctx.globalAlpha = 0.9; ctx.lineWidth = 2; ctx.beginPath();
      [0, 1, 2, 3, 0].forEach((k, j) => { const p = O[k]; if (!p) return; j ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy); });
      ctx.stroke();
      O.forEach((p, k) => {
        ctx.globalAlpha = 1; ctx.fillStyle = accent;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, k < 4 ? 5 : 3.6, 0, 7); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = css('--panel'); ctx.lineWidth = 1.5; ctx.stroke();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [mode, orbitIx, spin, orbit, md]);

  // drag to rotate
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; (e.target as Element).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    rot.current.yaw += (e.clientX - drag.current.x) * 0.01;
    rot.current.pitch = Math.max(-1.4, Math.min(1.4, rot.current.pitch + (e.clientY - drag.current.y) * 0.01));
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { drag.current = null; };

  const ratioTag =
    md.spreadRatio < 0.1 ? 'collapsed to a point'
      : md.regularity > 0.9 ? 'spread into a structured orbit'
      : 'scattered, unstructured';

  return (
    <figure className="fig">
      <div className="fig-title">How the latent encodes the board's symmetry</div>
      <div className="fig-sub">
        Every dot is one of the {data.n} positions, its 24-D latent projected to 3-D (drag to rotate).
        The <b style={{ color: 'var(--accent)' }}>highlighted orbit</b> is one board and its 8 rotations/reflections.
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

      <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        style={{ width: '100%', height: '340px', background: 'var(--bg-soft)', borderRadius: 12, touchAction: 'none', cursor: 'grab', display: 'block' }} />

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', margin: '.8rem 0 0', fontFamily: 'var(--sans)', fontSize: '.8rem' }}>
        <Stat label="orbit spread" value={md.spreadRatio.toFixed(3)} hint="0 = all rotations at one point" />
        <Stat label="orbit regularity" value={md.regularity.toFixed(2)} hint="1 = rotations evenly arranged, a real orbit" />
        <span style={{ alignSelf: 'center', color: 'var(--accent)', fontWeight: 600 }}>{ratioTag}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.4rem' }}>
          <MiniBtn onClick={() => setOrbitIx((i) => i + 1)}>another board</MiniBtn>
          <MiniBtn onClick={() => setSpin((s) => !s)}>{spin ? 'pause' : 'spin'}</MiniBtn>
        </div>
      </div>

      <div className="callout" style={{ marginTop: '1rem', marginBottom: 0 }}>{LABELS[mode].blurb}</div>
    </figure>
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
