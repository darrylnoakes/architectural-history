import { useEffect, useMemo, useRef, useState } from 'react';
import { geoDistance, geoGraticule10, geoOrthographic, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useApp } from '../state';
import { REGION_LIST, type RegionInfo } from '../regions';
import { useRegion } from './useRegion';
import { IconClose } from './icons';
import './regions.css';

const close = () => useApp.setState({ regionsOpen: false });

/** The globe is drawn in a fixed viewBox and scaled by CSS. */
const SIZE = 440;
const R = 188;
/** How far north or south the globe may be tilted, in degrees. */
const MAX_TILT = 70;
/** How far in the globe can be zoomed: enough to pull the European regions well apart. */
const MAX_ZOOM = 7;

/** Which side of its marker each region's name sits, so the crowded European names do not collide. */
const LABEL_SIDE: Record<string, Side> = {
  england: 'left',
  france: 'below',
  germany: 'right',
  italy: 'right',
  greece: 'below',
  israel: 'right',
  egypt: 'left',
};

type Rotation = [number, number];

/** The rotation that puts [lat, lon] in the middle of the globe. */
function rotationFor([lat, lon]: [number, number]): Rotation {
  return [-lon, Math.max(-MAX_TILT, Math.min(MAX_TILT, -lat))];
}

let landCache: FeatureCollection | Feature | null = null;
function useLand() {
  const [land, setLand] = useState(landCache);
  useEffect(() => {
    if (landCache) return;
    let live = true;
    import('world-atlas/land-110m.json').then((m) => {
      const topo = (m.default ?? m) as unknown as Topology<{ land: GeometryCollection }>;
      landCache = feature(topo, topo.objects.land);
      if (live) setLand(landCache);
    });
    return () => {
      live = false;
    };
  }, []);
  return land;
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function RegionsDialog() {
  const open = useApp((s) => s.regionsOpen);
  if (!open) return null;
  return <Dialog />;
}

function Dialog() {
  const { region } = useRegion();
  const [hot, setHot] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Escape closes; while open, keys go to the dialog and not to the town behind it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
      if (e.key !== 'Tab') e.stopPropagation();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  // focus the dialog so keyboard users start inside it
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  const choose = (r: RegionInfo) => {
    if (r.status !== 'ready') return;
    if (r.id !== region.id) useApp.getState().setRegion(r.id);
    close();
  };

  const onMarker = (r: RegionInfo) => {
    if (r.status === 'ready') return choose(r);
    setHot(r.id);
    const row = listRef.current?.querySelector<HTMLElement>(`[data-region="${r.id}"]`);
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const ready = REGION_LIST.filter((r) => r.status === 'ready').length;

  return (
    <div className="modal-back rg-back" onClick={close}>
      <div
        ref={dialogRef}
        className="modal panel rg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rg-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-head rg-head">
          <div>
            <div className="kicker">A history of architecture</div>
            <h2 id="rg-title">Choose a region</h2>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="rg-body">
          <div className="rg-globe-col">
            <Globe hot={hot} onMarker={onMarker} />
            <p className="rg-hint">Drag to turn the globe. Scroll, pinch or use the buttons to zoom in where the regions crowd together.</p>
          </div>
          <div className="rg-list-col">
            <p className="rg-intro">
              Each region tells its story through one place, rebuilt age by age. {ready === 1 ? 'One is' : `${ready} are`}{' '}
              built so far; the others are planned, and many are where {region.name}’s ideas came from or went.
            </p>
            <ul className="rg-list" ref={listRef}>
              {REGION_LIST.map((r) => (
                <Row key={r.id} r={r} hot={hot === r.id} setHot={setHot} choose={choose} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  r,
  hot,
  setHot,
  choose,
}: {
  r: RegionInfo;
  hot: boolean;
  setHot: (id: string | null) => void;
  choose: (r: RegionInfo) => void;
}) {
  const { region } = useRegion();
  const current = r.id === region.id;
  const ready = r.status === 'ready';
  const body = (
    <>
      <span className="rg-row-top">
        <span className="rg-name">{r.name}</span>
        {current ? (
          <span className="rg-status current">You are here</span>
        ) : ready ? (
          <span className="rg-status ready">Open</span>
        ) : (
          <span className="rg-status planned">Planned</span>
        )}
      </span>
      <span className="rg-sub">
        {r.subtitle} <span className="rg-sep">·</span> {r.span}
      </span>
      <span className="rg-blurb">{r.blurb}</span>
    </>
  );
  const handlers = {
    onMouseEnter: () => setHot(r.id),
    onFocus: () => setHot(r.id),
  };
  const cls = `rg-row ${ready ? 'ready' : 'planned'}${current ? ' current' : ''}${hot ? ' hot' : ''}`;
  return (
    <li data-region={r.id}>
      {ready ? (
        <button className={cls} onClick={() => choose(r)} {...handlers} aria-current={current ? 'true' : undefined}>
          {body}
        </button>
      ) : (
        <div className={cls} tabIndex={0} aria-label={`${r.name}, planned. ${r.subtitle}, ${r.span}.`} {...handlers}>
          {body}
        </div>
      )}
    </li>
  );
}

function Globe({ hot, onMarker }: { hot: string | null; onMarker: (r: RegionInfo) => void }) {
  const land = useLand();
  const { region } = useRegion();
  // start a little way in: at full-globe scale the European regions sit on top of one another
  const [zoom, setZoom] = useState(1.6);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [rot, setRot] = useState<Rotation>(() => rotationFor(region.location));
  const rotRef = useRef(rot);
  rotRef.current = rot;
  const frame = useRef(0);
  const tween = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // turn to the highlighted region
  useEffect(() => {
    if (!hot) return;
    const target = REGION_LIST.find((r) => r.id === hot);
    if (!target) return;
    const from = rotRef.current;
    const to = rotationFor(target.location);
    // the short way round
    const dl = ((((to[0] - from[0]) % 360) + 540) % 360) - 180;
    const dp = to[1] - from[1];
    if (Math.abs(dl) < 0.5 && Math.abs(dp) < 0.5) return;
    const dur = Math.min(750, 250 + Math.hypot(dl, dp) * 4);
    const t0 = performance.now();
    cancelAnimationFrame(tween.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const k = ease(t);
      setRot([from[0] + dl * k, from[1] + dp * k]);
      tween.current = t < 1 ? requestAnimationFrame(step) : 0;
    };
    tween.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(tween.current);
  }, [hot]);

  const clampZoom = (z: number) => Math.max(1, Math.min(MAX_ZOOM, z));

  // the wheel zooms; it must be a real listener so the page behind does not scroll
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => clampZoom(z * Math.exp(-e.deltaY * 0.0016)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // dragging turns the globe, two fingers pinch to zoom; at most one redraw per frame
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ id: number; x: number; y: number; start: Rotation; scale: number; moved: boolean; target: string | null } | null>(null);
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const pending = useRef<Rotation | null>(null);
  const spread = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    if (pointers.current.size === 2) {
      drag.current = null;
      pinch.current = { dist: spread() || 1, zoom: zoomRef.current };
      return;
    }
    if (drag.current || pointers.current.size > 2) return;
    cancelAnimationFrame(tween.current);
    tween.current = 0;
    const box = svgRef.current!.getBoundingClientRect();
    const hit = (e.target as Element).closest('[data-id]');
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      start: rotRef.current,
      // degrees per screen pixel: a drag across the globe's radius turns it about 57 degrees
      scale: (180 / Math.PI) / (R * zoomRef.current * (box.width / SIZE)),
      moved: false,
      target: hit?.getAttribute('data-id') ?? null,
    };
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      setZoom(clampZoom((pinch.current.zoom * spread()) / pinch.current.dist));
      return;
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    d.moved = true;
    pending.current = [d.start[0] + dx * d.scale, Math.max(-MAX_TILT, Math.min(MAX_TILT, d.start[1] - dy * d.scale))];
    if (!frame.current) {
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        if (pending.current) setRot(pending.current);
      });
    }
  };
  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved && d.target && e.type === 'pointerup') {
      const r = REGION_LIST.find((x) => x.id === d.target);
      if (r) onMarker(r);
    }
  };

  const { projection, path } = useMemo(() => {
    const projection = geoOrthographic()
      .scale(R * zoom)
      .translate([SIZE / 2, SIZE / 2])
      .rotate([rot[0], rot[1], 0])
      .clipAngle(90)
      .precision(0.7);
    return { projection, path: geoPath(projection) };
  }, [rot, zoom]);

  const graticule = useMemo(() => geoGraticule10(), []);
  const centre: [number, number] = [-rot[0], -rot[1]];
  const hotRegion = hot ?? null;
  const markers = useMemo(() => placeMarkers(projection, centre, hotRegion, region.id), [projection, hotRegion, region.id]);

  return (
    <div className="rg-globe-wrap">
      <div className="rg-zoom" role="group" aria-label="Zoom the globe">
        <button onClick={() => setZoom((z) => clampZoom(z * 1.5))} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
          +
        </button>
        <button onClick={() => setZoom((z) => clampZoom(z / 1.5))} disabled={zoom <= 1} aria-label="Zoom out">
          −
        </button>
      </div>
    <svg
      ref={svgRef}
      className="rg-globe"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      onDoubleClick={() => setZoom((z) => (z >= MAX_ZOOM ? 1 : clampZoom(z * 1.6)))}
      aria-label={`A globe showing ${REGION_LIST.length} regions`}
    >
      <defs>
        <radialGradient id="rg-shade" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#1f272a" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <circle className="rg-sea" cx={SIZE / 2} cy={SIZE / 2} r={R * zoom} />
      <path className="rg-grat" d={path(graticule) ?? ''} />
      {land && <path className="rg-land" d={path(land as Feature<Geometry>) ?? ''} />}
      <circle className="rg-shade" cx={SIZE / 2} cy={SIZE / 2} r={R * zoom} fill="url(#rg-shade)" />
      <circle className="rg-rim" cx={SIZE / 2} cy={SIZE / 2} r={R * zoom} />

      <g className="rg-markers">
        {markers.map(({ r, p, label }) => {
          const isHot = hotRegion === r.id;
          const current = r.id === region.id;
          return (
            <g
              key={r.id}
              data-id={r.id}
              className={`rg-mk ${r.status}${current ? ' current' : ''}${isHot ? ' hot' : ''}`}
              transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`}
            >
              <title>{r.status === 'ready' ? r.name : `${r.name} (planned)`}</title>
              <circle className="rg-hit" r={13} />
              {current && <circle className="rg-ring" r={9} />}
              <circle className="rg-dot" r={r.status === 'ready' ? 5 : 4.2} />
              {label && (
                <text x={label.x} y={label.y} textAnchor={label.anchor}>
                  {r.name}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
    </div>
  );
}

type Side = 'left' | 'right' | 'above' | 'below';
interface Placed {
  r: RegionInfo;
  p: [number, number];
  label: { x: number; y: number; anchor: 'start' | 'middle' | 'end' } | null;
}

/**
 * Projects the visible markers and places their names: the current and highlighted regions first,
 * then the rest from the middle of the globe outwards, each on the first side that does not overlap
 * a name already placed. A name with no free side is left off (its marker still shows).
 */
function placeMarkers(projection: GeoProjection, centre: [number, number], hot: string | null, here: string): Placed[] {
  const items: (Placed & { d: number; rank: number })[] = [];
  for (const r of REGION_LIST) {
    const [lat, lon] = r.location;
    const d = geoDistance([lon, lat], centre);
    if (d > Math.PI / 2 - 0.02) continue;
    const p = projection([lon, lat]);
    if (!p) continue;
    const rank = r.id === here ? 0 : r.id === hot ? 1 : 2;
    items.push({ r, p: p as [number, number], label: null, d, rank });
  }
  const order = [...items].sort((a, b) => a.rank - b.rank || a.d - b.d);
  const boxes: [number, number, number, number][] = [];
  const CH = 7.6; // rough width of a character, in viewBox units
  const H = 13;
  for (const it of order) {
    const w = it.r.name.length * CH * (it.rank === 0 ? 1.08 : 1);
    const off = it.rank === 0 ? 11 : 9;
    const pref = LABEL_SIDE[it.r.id] ?? 'right';
    const sides: Side[] = [pref, ...(['right', 'left', 'below', 'above'] as Side[]).filter((x) => x !== pref)];
    let chosen: { box: [number, number, number, number]; label: NonNullable<Placed['label']> } | null = null;
    for (const side of sides) {
      const [x, y] = it.p;
      const label: NonNullable<Placed['label']> =
        side === 'left'
          ? { x: -off, y: 4, anchor: 'end' }
          : side === 'right'
            ? { x: off, y: 4, anchor: 'start' }
            : side === 'above'
              ? { x: 0, y: -off, anchor: 'middle' }
              : { x: 0, y: off + 9, anchor: 'middle' };
      const left = x + label.x - (label.anchor === 'end' ? w : label.anchor === 'middle' ? w / 2 : 0);
      const top = y + label.y - H + 3;
      const box: [number, number, number, number] = [left, top, left + w, top + H];
      const inside = box[0] >= 2 && box[2] <= SIZE - 2 && box[1] >= 2 && box[3] <= SIZE - 2;
      const clear = !boxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
      if (inside && clear) {
        chosen = { box, label };
        break;
      }
      if (!chosen && it.rank < 2 && side === pref) chosen = { box, label }; // always name these
    }
    if (chosen) {
      boxes.push(chosen.box);
      it.label = chosen.label;
    }
  }
  return items.map(({ r, p, label }) => ({ r, p, label }));
}
