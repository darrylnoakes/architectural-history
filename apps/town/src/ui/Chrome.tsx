import { useEffect, useRef } from 'react';
import type { NavMode } from '@ah/engine';
import { useApp } from '../state';
import { Engine, region } from '../world/engine';
import { IconClose, IconDrone, IconHelp, IconLeft, IconOrbit, IconPlay, IconWalk } from './icons';

export function Brand() {
  return (
    <div className="brand panel">
      <div className="kicker">A history of architecture</div>
      <div className="brand-title">{region.name}</div>
      <div className="brand-sub">{region.subtitle}, 500 BC to today</div>
    </div>
  );
}

const MODES: { id: NavMode; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'orbit', label: 'Model', icon: <IconOrbit />, hint: 'Turn the model (1)' },
  { id: 'walk', label: 'Walk', icon: <IconWalk />, hint: 'Walk the streets (2)' },
  { id: 'drone', label: 'Fly', icon: <IconDrone />, hint: 'Fly a drone (3)' },
];

export function ModeSwitch() {
  const mode = useApp((s) => s.mode);
  return (
    <div className="modes panel">
      {MODES.map((m) => (
        <button
          key={m.id}
          className={mode === m.id ? 'on' : ''}
          title={m.hint}
          onClick={() => useApp.setState({ mode: m.id, intro: false })}
        >
          {m.icon}
          <span>{m.label}</span>
        </button>
      ))}
      <button className="help-btn" title="Controls (H)" onClick={() => useApp.setState({ helpOpen: true })}>
        <IconHelp />
      </button>
    </div>
  );
}

export function StreetBanner() {
  const street = useApp((s) => s.street);
  useApp((s) => s.ready);
  if (!street) return null;
  const lineage = Engine.instance?.lineage(street.lineageId);
  return (
    <div className="street-banner panel">
      <button className="btn" onClick={() => useApp.getState().closeStreet()}>
        <IconLeft /> Back to the town
      </button>
      <div>
        <div className="kicker">Lineage street</div>
        <div className="street-title">{lineage?.name}</div>
        <div className="street-role">{lineage?.role}</div>
      </div>
    </div>
  );
}

export function Intro() {
  const intro = useApp((s) => s.intro);
  const ready = useApp((s) => s.ready);
  if (!intro || !ready) return null;
  return (
    <div className="intro panel">
      <h1>One town, twenty-five centuries</h1>
      <p>
        This is an English market town on a river. Every plot keeps its purpose while its buildings are rebuilt in the
        manner of each age, from Iron Age roundhouses to glass and timber. Press play and watch, or drag the timeline
        and go exploring.
      </p>
      <div className="intro-actions">
        <button className="btn primary" onClick={() => useApp.setState({ intro: false, playing: true })}>
          <IconPlay /> Play the story
        </button>
        <button className="btn" onClick={() => useApp.setState({ intro: false })}>
          Explore on my own
        </button>
      </div>
      <p className="fine">Click any building to learn what it is. Controls are under the ? button.</p>
    </div>
  );
}

export function Help() {
  const open = useApp((s) => s.helpOpen);
  const touch = useApp((s) => s.touch);
  if (!open) return null;
  return (
    <div className="modal-back" onClick={() => useApp.setState({ helpOpen: false })}>
      <div className="modal panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-head">
          <h2>Getting around</h2>
          <button className="icon-btn" onClick={() => useApp.setState({ helpOpen: false })} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="scroll help-grid">
          <section>
            <h3>Time</h3>
            <dl>
              <dt>Play or pause</dt>
              <dd>{touch ? 'The round button' : 'P, or Space in Model view'}</dd>
              <dt>Scrub</dt>
              <dd>Drag along the coloured bar</dd>
              {!touch && (
                <>
                  <dt>Step through time</dt>
                  <dd>[ and ] (works while walking)</dd>
                  <dt>Next or previous era</dt>
                  <dd>Page Down, Page Up</dd>
                </>
              )}
              <dt>Arrows above the bar</dt>
              <dd>Ideas arriving from, or leaving for, other places</dd>
            </dl>
          </section>
          <section>
            <h3>Model view</h3>
            <dl>
              <dt>Turn</dt>
              <dd>{touch ? 'Drag with one finger' : 'Drag'}</dd>
              <dt>Zoom</dt>
              <dd>{touch ? 'Pinch' : 'Scroll'}</dd>
              <dt>Slide</dt>
              <dd>{touch ? 'Drag with two fingers' : 'Right-drag, or W A S D'}</dd>
              <dt>Inspect</dt>
              <dd>{touch ? 'Tap a building' : 'Click a building'}</dd>
            </dl>
          </section>
          <section>
            <h3>Walk and Fly</h3>
            {touch ? (
              <dl>
                <dt>Move</dt>
                <dd>The stick, bottom left</dd>
                <dt>Look</dt>
                <dd>Drag anywhere else</dd>
                <dt>Inspect</dt>
                <dd>Tap a building</dd>
              </dl>
            ) : (
              <dl>
                <dt>Look</dt>
                <dd>Click the scene, then move the mouse. Esc frees the pointer</dd>
                <dt>Move</dt>
                <dd>W A S D. Hold Shift to run or fly fast</dd>
                <dt>Up and down (flying)</dt>
                <dd>Space or E, and Q</dd>
                <dt>Inspect</dt>
                <dd>Aim the dot at a building and click</dd>
              </dl>
            )}
          </section>
          <section>
            <h3>Lineage street</h3>
            <p>
              Select a building and choose “Line them all up” to see every building that ever stood on that plot side
              by side, oldest on the left. {touch ? '' : 'L toggles it.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function Crosshair() {
  const mode = useApp((s) => s.mode);
  const locked = useApp((s) => s.locked);
  const touch = useApp((s) => s.touch);
  if (mode === 'orbit' || touch) return null;
  return locked ? (
    <>
      <div className="crosshair" />
      <div className="lock-hint">Click a building to inspect it · Esc to free the pointer</div>
    </>
  ) : (
    <div className="lock-hint strong">Click the scene to look around · W A S D to move</div>
  );
}

/** On-screen stick and buttons for walking and flying on touch screens. */
export function TouchControls() {
  const mode = useApp((s) => s.mode);
  const touch = useApp((s) => s.touch);
  const pad = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pad.current;
    if (!el) return;
    let id: number | null = null;
    const set = (x: number, y: number) => {
      const nav = Engine.instance?.nav;
      if (nav) nav.input.stick.set(x, y);
      if (knob.current) knob.current.style.transform = `translate(${x * 34}px, ${-y * 34}px)`;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const r = el.getBoundingClientRect();
      let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      let y = -(e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const len = Math.hypot(x, y);
      if (len > 1) {
        x /= len;
        y /= len;
      }
      set(x, y);
    };
    const down = (e: PointerEvent) => {
      id = e.pointerId;
      el.setPointerCapture(e.pointerId);
      move(e);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      set(0, 0);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      set(0, 0);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [mode, touch]);

  if (!touch || mode === 'orbit') return null;
  const hold = (key: 'up' | 'down' | 'run') => ({
    onPointerDown: (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const nav = Engine.instance?.nav;
      if (nav) nav.input[key] = true;
    },
    onPointerUp: () => {
      const nav = Engine.instance?.nav;
      if (nav) nav.input[key] = false;
    },
    onPointerCancel: () => {
      const nav = Engine.instance?.nav;
      if (nav) nav.input[key] = false;
    },
  });
  return (
    <div className="touch">
      <div className="stick" ref={pad}>
        <div className="knob" ref={knob} />
      </div>
      <div className="touch-btns">
        {mode === 'drone' && (
          <>
            <button {...hold('up')}>Up</button>
            <button {...hold('down')}>Down</button>
          </>
        )}
        <button {...hold('run')}>{mode === 'drone' ? 'Fast' : 'Run'}</button>
      </div>
    </div>
  );
}
