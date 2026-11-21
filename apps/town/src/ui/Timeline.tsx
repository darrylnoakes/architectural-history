import { useCallback, useRef, useState } from 'react';
import { formatYear } from '@ah/engine';
import type { Influence } from '@ah/kit';
import { useApp } from '../state';
import { region, timeScale } from '../world/engine';
import { IconArrowIn, IconArrowOut, IconClose, IconHome, IconPause, IconPlay } from './icons';

const css = (n: number) => '#' + n.toString(16).padStart(6, '0');
const SPEEDS = [0.5, 1, 2, 4];

export function InfluenceIcon({ dir }: { dir: Influence['dir'] }) {
  return dir === 'in' ? <IconArrowIn /> : dir === 'out' ? <IconArrowOut /> : <IconHome />;
}

export function influenceVerb(i: Influence) {
  return i.dir === 'in' ? `From ${i.place}` : i.dir === 'out' ? `To ${i.place}` : 'Home-grown';
}

export function Timeline() {
  const year = useApp((s) => s.year);
  const playing = useApp((s) => s.playing);
  const speed = useApp((s) => s.speed);
  const togglePlay = useApp((s) => s.togglePlay);
  const jumpTo = useApp((s) => s.jumpTo);
  const bar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Influence | null>(null);
  const era = timeScale.era(year);
  const t = timeScale.toT(year);
  const atEnd = year >= region.end;

  const scrub = useCallback(
    (clientX: number) => {
      const r = bar.current!.getBoundingClientRect();
      jumpTo(Math.round(timeScale.toYear((clientX - r.left) / r.width)));
      useApp.setState({ intro: false });
    },
    [jumpTo],
  );

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.tl-mark')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    scrub(e.clientX);
  };
  const onMove = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) scrub(e.clientX);
  };

  return (
    <footer className="timeline panel">
      {open && (
        <div className="tl-pop" style={{ left: `clamp(150px, ${timeScale.toT(open.year) * 100}%, calc(100% - 150px))` }}>
          <button className="icon-btn tl-pop-close" onClick={() => setOpen(null)} aria-label="Close">
            <IconClose />
          </button>
          <div className={`badge dir-${open.dir}`}>
            <InfluenceIcon dir={open.dir} /> {influenceVerb(open)} · {formatYear(open.year)}
          </div>
          <h4>{open.title}</h4>
          <p>{open.text}</p>
        </div>
      )}
      <div className="tl-head">
        <button
          className="play"
          onClick={() => {
            if (atEnd && !playing) jumpTo(region.start);
            togglePlay();
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <IconPause /> : <IconPlay />}
        </button>
        <div className="tl-now">
          <div className="tl-year">{formatYear(year)}</div>
          <button className="tl-era" onClick={() => useApp.setState((s) => ({ eraOpen: !s.eraOpen }))}>
            <span className="tl-era-name">{era.name}</span>
            <span className="tl-era-tag">{era.tagline}</span>
          </button>
        </div>
        <div className="tl-speed" role="group" aria-label="Playback speed">
          {SPEEDS.map((v) => (
            <button key={v} className={v === speed ? 'on' : ''} onClick={() => useApp.setState({ speed: v })}>
              {v}×
            </button>
          ))}
        </div>
      </div>
      <div className="tl-bar-wrap">
        <div className="tl-marks">
          {region.influences.map((inf) => (
            <button
              key={inf.id}
              className={`tl-mark dir-${inf.dir}${open?.id === inf.id ? ' on' : ''}`}
              style={{ left: `${timeScale.toT(inf.year) * 100}%` }}
              title={`${formatYear(inf.year)}: ${inf.title}`}
              onClick={() => {
                setOpen(open?.id === inf.id ? null : inf);
                jumpTo(inf.year);
              }}
            >
              <InfluenceIcon dir={inf.dir} />
            </button>
          ))}
        </div>
        <div className="tl-bar" ref={bar} onPointerDown={onDown} onPointerMove={onMove}>
          {region.eras.map((e, i) => {
            const [a, b] = timeScale.spans[i];
            return (
              <div
                key={e.id}
                className={`tl-seg${e.id === era.id ? ' on' : ''}`}
                style={{ width: `${(b - a) * 100}%`, background: css(e.color) }}
                title={`${e.name}, ${formatYear(e.from)} to ${formatYear(e.to)}`}
              >
                <span>{e.name}</span>
              </div>
            );
          })}
          <div className="tl-head-pin" style={{ left: `${t * 100}%` }} />
        </div>
        <div className="tl-ticks">
          {region.eras.map((e, i) => (
            <span key={e.id} style={{ left: `${timeScale.spans[i][0] * 100}%` }}>
              {formatYear(e.from)}
            </span>
          ))}
          <span style={{ left: '100%' }} className="last">
            {formatYear(region.end)}
          </span>
        </div>
      </div>
    </footer>
  );
}
