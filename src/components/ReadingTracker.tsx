import { useEffect, useMemo, useState } from 'react';
import { TRACKS, TOTAL, CORE_TOTAL } from '../data/readingList';

const STORAGE_KEY = 'rl-reading-room-v1';

type ReadMap = Record<string, boolean>;

function loadState(): ReadMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadMap) : {};
  } catch {
    return {};
  }
}

export default function ReadingTracker() {
  // Start empty so the server-rendered HTML and the first client render match.
  // Real progress is loaded from localStorage after mount.
  const [read, setRead] = useState<ReadMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [onlyCore, setOnlyCore] = useState(false);
  const [hideRead, setHideRead] = useState(false);

  useEffect(() => {
    setRead(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(read));
    } catch {
      /* storage unavailable — progress just won't persist */
    }
  }, [read, hydrated]);

  const doneCount = useMemo(
    () => Object.values(read).filter(Boolean).length,
    [read],
  );
  const pct = TOTAL ? Math.round((doneCount / TOTAL) * 100) : 0;

  function toggle(id: string) {
    setRead((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function reset() {
    if (typeof window !== 'undefined' && !window.confirm('Clear all reading progress on this device?')) return;
    setRead({});
  }

  return (
    <section className="rt" aria-label="Reading tracker">
      <div className="rt-bar">
        <span className="rt-bar__id">
          Reading&nbsp;Room · <b>{pct}%</b>
        </span>
        <div className="rt-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="rt-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="rt-count">
          {doneCount}/{TOTAL}
        </span>
        <div className="rt-toggles">
          <button
            type="button"
            className="rt-toggle"
            aria-pressed={onlyCore}
            onClick={() => setOnlyCore((v) => !v)}
          >
            Essentials
          </button>
          <button
            type="button"
            className="rt-toggle"
            aria-pressed={hideRead}
            onClick={() => setHideRead((v) => !v)}
          >
            Hide read
          </button>
          <button type="button" className="rt-toggle" onClick={reset} title="Clear all progress">
            Reset
          </button>
        </div>
      </div>

      <div className="rt-legend">
        <span><i className="rt-dot rt-dot--core" /> Essential — the critical path</span>
        <span><i className="rt-dot rt-dot--opt" /> Deepen / optional</span>
        <span><i className="rt-dot rt-dot--read" /> Marked read</span>
        <span>{CORE_TOTAL} essentials of {TOTAL}</span>
      </div>

      {TRACKS.map((track) => {
        const trackDone = track.papers.filter((p) => read[p.id]).length;
        return (
          <div className="rt-group" key={track.n}>
            <div className="rt-group__head">
              <span className="rt-group__num">{track.n}</span>
              <div>
                <h2 className="rt-group__title">{track.title}</h2>
                <p className="rt-group__sub">{track.sub}</p>
              </div>
              <span className="rt-group__tally">
                {trackDone}/{track.papers.length}
              </span>
            </div>

            <ul className="rt-list">
              {track.papers.map((p) => {
                const isRead = !!read[p.id];
                if (onlyCore && !p.core) return null;
                if (hideRead && isRead) return null;
                return (
                  <li className={`rt-paper${isRead ? ' rt-paper--read' : ''}`} key={p.id}>
                    <input
                      className="rt-check"
                      type="checkbox"
                      checked={isRead}
                      onChange={() => toggle(p.id)}
                      aria-label={`Mark read: ${p.t}`}
                    />
                    <div className="rt-paper__body">
                      <a className="rt-paper__title" href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.t}
                        {p.s ? <span className="short"> ({p.s})</span> : null}
                      </a>
                      <div className="rt-paper__meta">{p.meta}</div>
                      <p className="rt-paper__why">{p.why}</p>
                      <div className="rt-tags">
                        <span className={`rt-tag${p.core ? ' rt-tag--core' : ''}`}>
                          {p.core ? 'Essential' : 'Optional'}
                        </span>
                        <span className="rt-tag">{p.type}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
