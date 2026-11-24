import { useCallback, useRef, useState } from 'react';
import { formatYear } from '@ah/engine';
import type { Influence } from '@ah/kit';
import { useApp } from '../state';
import { scaleOf } from '../regions';
import { activeTimeline } from '../timeline';
import { IconArrowIn, IconArrowOut, IconClose, IconHome, IconList, IconPause, IconPlay } from './icons';

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
  const regionId = useApp((s) => s.regionId);
  const screen = useApp((s) => s.screen);
  const { scale: timeScale, regions } = activeTimeline({ regionId, screen });
  const single = regions.length === 1;
  const region = regions[0];
  const here = regions.map((r) => (year >= r.start && year <= r.end ? scaleOf(r).era(year) : null));
  const era = here[0] ?? scaleOf(region).era(year);
  const t = timeScale.toT(year);
  const atEnd = year >= timeScale.end;
  // tick labels: every era boundary, dropping those that would print on top of the one before
  const ticks: number[] = [];
  for (const y of [...new Set(regions.flatMap((r) => r.eras.map((e) => e.from)))].sort((a, b) => a - b)) {
    if (!ticks.length || timeScale.toT(y) - timeScale.toT(ticks[ticks.length - 1]) > (single ? 0 : 0.045)) ticks.push(y);
  }

  const scrub = useCallback(
    (clientX: number) => {
      const r = bar.current!.getBoundingClientRect();
      jumpTo(Math.round(timeScale.toYear((clientX - r.left) / r.width)));
      useApp.setState({ intro: false });
    },
    [jumpTo, timeScale],
  );

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.tl-mark')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    useApp.setState({ scrubbing: true });
    scrub(e.clientX);
  };
  // the town waits for a fast drag to settle, and catches up the moment the bar is let go
  const onUp = () => useApp.setState({ scrubbing: false });
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
            if (atEnd && !playing) jumpTo(timeScale.start);
            togglePlay();
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <IconPause /> : <IconPlay />}
        </button>
        <div className="tl-now">
          <div className="tl-year">{formatYear(year)}</div>
          {single ? (
            <button className="tl-era" onClick={() => useApp.setState((s) => ({ eraOpen: !s.eraOpen }))}>
              <span className="tl-era-name">{era.name}</span>
              <span className="tl-era-tag">{era.tagline}</span>
            </button>
          ) : (
            <div className="tl-era tl-era-pair">
              {regions.map((r, i) => (
                <span key={r.id} className="tl-era-name" style={{ ['--era' as string]: css(here[i]?.color ?? 0xb9b4a8) }}>
                  <span className="tl-pair-region">{r.name}: </span>
                  {here[i]?.name ?? (year < r.start ? 'not begun' : 'ended')}
                </span>
              ))}
            </div>
          )}
        </div>
        {screen.kind === 'town' && (
          <button className="tl-ideas" onClick={() => useApp.setState({ ideasOpen: true, intro: false })} title="List every idea that arrived or left">
            <IconList /> <span>Ideas</span>
          </button>
        )}
        <div className="tl-speed" role="group" aria-label="Playback speed">
          {SPEEDS.map((v) => (
            <button key={v} className={v === speed ? 'on' : ''} onClick={() => useApp.setState({ speed: v })}>
              {v}×
            </button>
          ))}
        </div>
      </div>
      <div className={`tl-bar-wrap${single ? '' : ' pair'}`}>
        <div className="tl-marks">
          {(screen.kind === 'town' ? region.influences : []).map((inf) => (
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
        <div className="tl-bar" ref={bar} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onLostPointerCapture={onUp}>
          {regions.map((r, k) => (
            <div className="tl-row" key={r.id}>
              {r.eras.map((e) => {
                const a = timeScale.toT(e.from);
                const b = timeScale.toT(e.to);
                return (
                  <div
                    key={e.id}
                    className={`tl-seg${e.id === here[k]?.id ? ' on' : ''}`}
                    style={{ left: `${a * 100}%`, width: `${(b - a) * 100}%`, background: css(e.color) }}
                    title={`${single ? '' : r.name + ': '}${e.name}, ${formatYear(e.from)} to ${formatYear(e.to)}`}
                  >
                    <span>{e.name}</span>
                  </div>
                );
              })}
              {!single && <em className="tl-row-name">{r.name}</em>}
            </div>
          ))}
          <div className="tl-head-pin" style={{ left: `${t * 100}%` }} />
        </div>
        <div className="tl-ticks">
          {ticks.map((y) => (
            <span key={y} style={{ left: `${timeScale.toT(y) * 100}%` }}>
              {formatYear(y)}
            </span>
          ))}
          <span style={{ left: '100%' }} className="last">
            {formatYear(timeScale.end)}
          </span>
        </div>
      </div>
    </footer>
  );
}
