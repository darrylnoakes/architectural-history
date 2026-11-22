import { useEffect, useRef, useState } from 'react';
import type { NavMode } from '@ah/engine';
import { useApp } from '../state';
import { formatYear } from '@ah/engine';
import { Engine } from '../world/engine';
import { useRegion } from './useRegion';
import { IconClose, IconDown, IconDrone, IconHelp, IconLeft, IconLibrary, IconOrbit, IconPlay, IconWalk } from './icons';

export function Brand() {
  const { region } = useRegion();
  return (
    <button className="brand panel" onClick={() => useApp.setState({ regionsOpen: true, intro: false })} title="Choose a region">
      <span className="kicker">A history of architecture</span>
      <span className="brand-title">
        {region.name} <IconDown />
      </span>
      <span className="brand-sub">{region.subtitle}, {formatYear(region.start)} to today</span>
    </button>
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
      <button className="help-btn" title="Library of every building" onClick={() => useApp.getState().openLibrary()}>
        <IconLibrary />
      </button>
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
  const { region } = useRegion();
  if (!intro || !ready) return null;
  return (
    <div className="intro panel">
      <h1>{region.intro.title}</h1>
      <p>{region.intro.text} Press play and watch, or drag the timeline and go exploring.</p>
      <div className="intro-actions">
        <button className="btn primary" onClick={() => useApp.setState({ intro: false, playing: true })}>
          <IconPlay /> Play the story
        </button>
        <button className="btn" onClick={() => useApp.setState({ intro: false })}>
          Explore on my own
        </button>
      </div>
      <p className="fine">Click any building to learn what it is. Other regions are under the title, top left; controls are under the ? button.</p>
    </div>
  );
}

/** Shown once if the town is drawing slowly at full quality. */
export function SlowNotice() {
  const slow = useApp((s) => s.slow);
  const intro = useApp((s) => s.intro);
  if (!slow || intro) return null;
  return (
    <div className="slow panel" role="status">
      <p>
        <strong>Running slowly?</strong> Simpler graphics drop the shadows and thin the trees. You can switch back under the ? button.
      </p>
      <div className="slow-actions">
        <button className="btn primary small" onClick={() => useApp.getState().setQuality('low')}>
          Use simpler graphics
        </button>
        <button className="btn small" onClick={() => useApp.setState({ slow: false, slowDismissed: true })}>
          Leave it
        </button>
      </div>
    </div>
  );
}

export function Help() {
  const open = useApp((s) => s.helpOpen);
  const touch = useApp((s) => s.touch);
  const quality = useApp((s) => s.quality);
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
          <section className="help-graphics">
            <h3>Graphics</h3>
            <div className="seg" role="group" aria-label="Graphics quality">
              <button className={quality === 'high' ? 'on' : ''} onClick={() => useApp.getState().setQuality('high')}>
                Full
              </button>
              <button className={quality === 'low' ? 'on' : ''} onClick={() => useApp.getState().setQuality('low')}>
                Simple
              </button>
            </div>
            <p>Simple leaves out the shadows and most of the trees. Choose it if the town moves in jerks; the choice is remembered on this device.</p>
          </section>
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
                <dt>Run or fly fast</dt>
                <dd>Tap the button to switch it on, tap again to switch it off</dd>
                <dt>Height (flying)</dt>
                <dd>Hold Up or Down; the stick keeps you level</dd>
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
  // running and flying fast are switched on and off, not held, so a thumb is free to steer
  const [fast, setFast] = useState(false);

  useEffect(() => {
    const nav = Engine.instance?.nav;
    if (nav) nav.input.run = fast && touch && mode !== 'orbit';
    return () => {
      if (nav) nav.input.run = false;
    };
  }, [fast, touch, mode]);

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
  const hold = (key: 'up' | 'down') => ({
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
        <button className={fast ? 'on' : ''} aria-pressed={fast} onClick={() => setFast((v) => !v)}>
          {mode === 'drone' ? 'Fast' : 'Run'}
        </button>
      </div>
    </div>
  );
}
