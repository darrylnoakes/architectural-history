import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TimeScale, formatYear } from '@ah/engine';
import { KINDS, type BuildingDef, type BuildingKind, type Lineage, type Region } from '@ah/kit';
import { REGIONS, allLineages, scaleOf } from '../regions';
import { useApp, type LineageRef } from '../state';
import { Studio } from '../studio/studio';
import type { Subject } from '../studio/subject';
import { cachedThumbnail, thumbnail } from '../studio/thumbs';
import { BuildingText } from './BuildingText';
import { IconCompare, IconLeft, IconLibrary, IconRight, IconSearch } from './icons';
import { Timeline } from './Timeline';
import './explorer.css';

const css = (n: number) => '#' + n.toString(16).padStart(6, '0');
const SEED = 1;

function resolve(ref: LineageRef): { region: Region; lineage: Lineage } | null {
  const region = REGIONS[ref.region];
  const lineage = region?.lineages.find((l) => l.id === ref.lineage);
  return region && lineage ? { region, lineage } : null;
}

/** Which stage of a lineage stands in a year (the first one if the year is before it begins). */
function stageAt(lineage: Lineage, year: number): number {
  let i = 0;
  lineage.stages.forEach((st, k) => {
    if (year >= st.from) i = k;
  });
  return i;
}

/** The years a stage lasts in its own lineage: until the next begins, or until its own end if that comes first. */
function span(lineage: Lineage, i: number): { from: number; to: number } {
  const st = lineage.stages[i];
  const next = lineage.stages[i + 1]?.from ?? Infinity;
  const cut = st.end && st.end.fate !== 'renew' ? st.end.year : Infinity;
  return { from: st.from, to: Math.min(next, cut) };
}

const subjectOf = (lineage: Lineage, def: BuildingDef): Subject => ({ lineage, def, seed: SEED });

const StudioContext = createContext<Studio | null>(null);

// ------------------------------------------------------------------ thumbnails

function Thumb({ subject, alt }: { subject: Subject; alt: string }) {
  const [url, setUrl] = useState(() => cachedThumbnail(subject) ?? '');
  const box = useRef<HTMLDivElement>(null);
  const key = `${subject.lineage.id}/${subject.def.id}`;
  useEffect(() => {
    const hit = cachedThumbnail(subject);
    if (hit !== undefined) {
      setUrl(hit);
      return;
    }
    setUrl('');
    let live = true;
    // only render pictures for cards that have come into view
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        thumbnail(subject).then((u) => live && setUrl(u));
      },
      { rootMargin: '300px' },
    );
    if (box.current) io.observe(box.current);
    return () => {
      live = false;
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <div className="thumb" ref={box}>
      {url ? <img src={url} alt={alt} draggable={false} /> : <div className="thumb-wait" />}
    </div>
  );
}

// ------------------------------------------------------------------ library

interface Item {
  region: Region;
  lineage: Lineage;
  index: number;
  def: BuildingDef;
  from: number;
  to: number;
  era: string;
  text: string;
}

function Library() {
  const [query, setQuery] = useState('');
  const [regionId, setRegionId] = useState('all');
  const [kind, setKind] = useState<BuildingKind | 'all'>('all');
  const [era, setEra] = useState('all');
  const [sort, setSort] = useState<'date' | 'type'>('date');

  const items = useMemo<Item[]>(
    () =>
      allLineages().flatMap(({ region, lineage }) =>
        lineage.stages.map((st, index) => {
          const { from, to } = span(lineage, index);
          return {
            region,
            lineage,
            index,
            def: st.def,
            from,
            to,
            era: scaleOf(region).era(from).id,
            text: [st.def.name, st.def.style, st.def.date, lineage.name, KINDS[lineage.kind].label, ...st.def.materials].join(' ').toLowerCase(),
          };
        }),
      ),
    [],
  );
  const regions = Object.values(REGIONS);
  const eraRegion = regionId === 'all' ? regions[0] : REGIONS[regionId];
  const kinds = useMemo(() => [...new Set(items.map((i) => i.lineage.kind))], [items]);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = items
    .filter(
      (i) =>
        (regionId === 'all' || i.region.id === regionId) &&
        (kind === 'all' || i.lineage.kind === kind) &&
        (era === 'all' || i.era === era) &&
        words.every((w) => i.text.includes(w)),
    )
    .sort((a, b) => (sort === 'type' ? a.lineage.kind.localeCompare(b.lineage.kind) || a.from - b.from : a.from - b.from || a.lineage.id.localeCompare(b.lineage.id)));

  return (
    <div className="library">
      <div className="lib-filters">
        <label className="lib-search">
          <IconSearch />
          <input
            type="search"
            placeholder="Search by name, style or material: Gothic, thatch, mill…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="lib-selects">
          <label>
            <span>Region</span>
            <select
              value={regionId}
              onChange={(e) => {
                setRegionId(e.target.value);
                setEra('all');
              }}
            >
              <option value="all">All regions</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Type</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as BuildingKind | 'all')}>
              <option value="all">All types</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {KINDS[k].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Era</span>
            <select value={era} onChange={(e) => setEra(e.target.value)}>
              <option value="all">All eras</option>
              {eraRegion.eras.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({formatYear(e.from)} to {formatYear(e.to)})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Order</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as 'date' | 'type')}>
              <option value="date">By date</option>
              <option value="type">By type</option>
            </select>
          </label>
        </div>
        <div className="lib-count">
          {shown.length} of {items.length} buildings
        </div>
      </div>
      <div className="lib-grid">
        {shown.map((i) => (
          <button
            key={`${i.region.id}/${i.lineage.id}/${i.def.id}`}
            className="lib-card"
            onClick={() => useApp.getState().openBuilding({ region: i.region.id, lineage: i.lineage.id }, i.from)}
          >
            <Thumb subject={subjectOf(i.lineage, i.def)} alt={i.def.name} />
            <span className="lib-card-text">
              <span className="lib-kind">
                <i style={{ background: css(scaleOf(i.region).era(i.from).color) }} />
                {KINDS[i.lineage.kind].label} · {i.region.name}
              </span>
              <strong>{i.def.name}</strong>
              <span className="lib-date">
                {i.def.style} · {i.def.date}
              </span>
            </span>
          </button>
        ))}
        {shown.length === 0 && <p className="lib-empty">Nothing matches. Try fewer filters.</p>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ one building through time

function StageStrip({ lineage, index, onPick }: { lineage: Lineage; index: number; onPick: (i: number) => void }) {
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // move the strip only: scrollIntoView would scroll the page as well
    const box = strip.current;
    const on = box?.querySelector<HTMLElement>('.on');
    if (box && on) {
      const delta = on.getBoundingClientRect().left - box.getBoundingClientRect().left;
      box.scrollTo({ left: box.scrollLeft + delta - box.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' });
    }
  }, [index, lineage.id]);
  return (
    <div className="stage-strip" ref={strip}>
      {lineage.stages.map((st, i) => (
        <button key={st.def.id} className={i === index ? 'on' : ''} onClick={() => onPick(i)} title={st.def.name}>
          <Thumb subject={subjectOf(lineage, st.def)} alt={st.def.name} />
          <span className="stage-year">{formatYear(st.from)}</span>
          <span className="stage-name">{st.def.name}</span>
        </button>
      ))}
    </div>
  );
}

function BuildingView({ at }: { at: LineageRef }) {
  const studio = useContext(StudioContext);
  const year = useApp((s) => s.year);
  const pane = useRef<HTMLDivElement>(null);
  const found = resolve(at);
  const index = found ? stageAt(found.lineage, year) : 0;
  const def = found?.lineage.stages[index]?.def;

  useEffect(() => {
    if (!studio || !pane.current) return;
    studio.setPanes([pane.current]);
    return () => studio.setPanes([]);
  }, [studio]);
  useEffect(() => {
    if (studio && found && def) studio.show(0, subjectOf(found.lineage, def));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio, found?.lineage.id, def?.id]);

  if (!found || !def) return <p className="lib-empty">That building is not in the library.</p>;
  const { region, lineage } = found;
  const { from, to } = span(lineage, index);
  const end = lineage.stages[index].end;
  const go = (i: number) => useApp.getState().jumpTo(lineage.stages[i].from);
  const others = allLineages().filter((l) => !(l.region.id === region.id && l.lineage.id === lineage.id));
  // by preference the same kind of building somewhere else; failing that, anything else
  const partner = others.find((l) => l.lineage.kind === lineage.kind && l.region.id !== region.id) ?? others.find((l) => l.lineage.kind === lineage.kind) ?? others[0];

  return (
    <div className="bview">
      <div className="bview-stage">
        <div className="pane" ref={pane} />
        <div className="pane-nav">
          <button className="round" disabled={index === 0} onClick={() => go(index - 1)} aria-label="Earlier building">
            <IconLeft />
          </button>
          <div className="pane-caption">
            <strong>{def.name}</strong>
            <span>
              {formatYear(from)}
              {to === Infinity ? ' to the present' : ` to ${formatYear(to)}`} · {index + 1} of {lineage.stages.length}
            </span>
          </div>
          <button className="round" disabled={index === lineage.stages.length - 1} onClick={() => go(index + 1)} aria-label="Later building">
            <IconRight />
          </button>
        </div>
        <StageStrip lineage={lineage} index={index} onPick={go} />
      </div>
      <aside className="bview-info">
        <div className="kicker">
          {KINDS[lineage.kind].label} · {region.name}
        </div>
        <h2>{def.name}</h2>
        <p className="tagline">
          {def.style} · {def.date}
        </p>
        <div className="bview-actions">
          <button className="btn primary" onClick={() => useApp.getState().showInTown(at, from)}>
            See it in the town
          </button>
          {partner && (
            <button
              className="btn"
              onClick={() => useApp.getState().openCompare(at, { region: partner.region.id, lineage: partner.lineage.id })}
            >
              <IconCompare /> Compare
            </button>
          )}
        </div>
        <div className="scroll">
          <p className="stood">
            {lineage.name}: {lineage.role}
          </p>
          <BuildingText def={def} region={region} />
          {end?.note && end.fate !== 'renew' && (
            <>
              <h3>What became of it</h3>
              <p>{end.note}</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

// ------------------------------------------------------------------ two lineages side by side

function LineagePicker({ value, onChange }: { value: LineageRef; onChange: (ref: LineageRef) => void }) {
  return (
    <select
      className="lineage-picker"
      value={`${value.region}/${value.lineage}`}
      onChange={(e) => {
        const [region, lineage] = e.target.value.split('/');
        onChange({ region, lineage });
      }}
    >
      {Object.values(REGIONS).map((r) => (
        <optgroup key={r.id} label={r.name}>
          {r.lineages.map((l) => (
            <option key={l.id} value={`${r.id}/${l.id}`}>
              {KINDS[l.kind].label}: {l.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function ComparePane({ at, year, onChange, paneRef }: { at: LineageRef; year: number; onChange: (ref: LineageRef) => void; paneRef: React.RefObject<HTMLDivElement | null> }) {
  const found = resolve(at);
  const index = found ? stageAt(found.lineage, year) : 0;
  const def = found?.lineage.stages[index]?.def;
  const sp = found ? span(found.lineage, index) : null;
  const before = found && year < found.lineage.stages[0].from;
  const gone = sp && year >= sp.to;
  return (
    <section className="cmp-pane">
      <div className="cmp-head">
        <LineagePicker value={at} onChange={onChange} />
        <button className="btn small" onClick={() => useApp.getState().openBuilding(at, year)} title="Open this one on its own">
          Details
        </button>
      </div>
      <div className="pane" ref={paneRef} />
      <div className="cmp-caption">
        {def && sp && (
          <>
            <strong>{def.name}</strong>
            <span>
              {def.style} · {formatYear(sp.from)}
              {sp.to === Infinity ? ' to the present' : ` to ${formatYear(sp.to)}`}
            </span>
            {before && <em>Not built yet in {formatYear(year)}: this is the first building on the plot.</em>}
            {gone && <em>Gone by {formatYear(year)}: nothing has replaced it yet.</em>}
          </>
        )}
      </div>
    </section>
  );
}

function Compare({ a, b }: { a: LineageRef; b: LineageRef }) {
  const studio = useContext(StudioContext);
  const year = useApp((s) => s.year);
  const pa = useRef<HTMLDivElement>(null);
  const pb = useRef<HTMLDivElement>(null);
  const fa = resolve(a);
  const fb = resolve(b);
  const da = fa ? fa.lineage.stages[stageAt(fa.lineage, year)].def : null;
  const db = fb ? fb.lineage.stages[stageAt(fb.lineage, year)].def : null;

  useEffect(() => {
    if (!studio || !pa.current || !pb.current) return;
    studio.setPanes([pa.current, pb.current]);
    return () => studio.setPanes([]);
  }, [studio]);
  useEffect(() => {
    if (studio) studio.show(0, fa && da ? subjectOf(fa.lineage, da) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio, fa?.lineage.id, da?.id]);
  useEffect(() => {
    if (studio) studio.show(1, fb && db ? subjectOf(fb.lineage, db) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio, fb?.lineage.id, db?.id]);

  return (
    <div className="compare">
      <div className="cmp-panes">
        <ComparePane at={a} year={year} paneRef={pa} onChange={(ref) => useApp.getState().openCompare(ref, b)} />
        <ComparePane at={b} year={year} paneRef={pb} onChange={(ref) => useApp.getState().openCompare(a, ref)} />
      </div>
      <Timeline />
    </div>
  );
}

// ------------------------------------------------------------------ shell

/** The full-screen views that sit over the town: the library, one building through time, and compare. */
export function Explorer() {
  const screen = useApp((s) => s.screen);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const open = screen.kind !== 'town';
  const needsStudio = screen.kind === 'building' || screen.kind === 'compare';

  useEffect(() => {
    if (!needsStudio || !canvas.current) return;
    const s = new Studio(canvas.current);
    setStudio(s);
    return () => {
      setStudio(null);
      s.dispose();
    };
  }, [needsStudio]);

  if (!open) return null;
  const s = useApp.getState();
  const first = allLineages()[0];
  const here: LineageRef = screen.kind === 'building' ? screen.ref : screen.kind === 'compare' ? screen.a : { region: first.region.id, lineage: first.lineage.id };
  const second = allLineages().find((l) => l.lineage.id !== here.lineage) ?? first;

  return (
    <div className={`explorer screen-${screen.kind}`}>
      {needsStudio && <canvas ref={canvas} className="studio-canvas" />}
      <header className="ex-head">
        <button className="btn" onClick={() => (screen.kind === 'library' ? s.closeScreen() : s.openLibrary())}>
          <IconLeft /> {screen.kind === 'library' ? 'Back to the town' : 'Library'}
        </button>
        <h1>{screen.kind === 'library' ? 'The library' : screen.kind === 'compare' ? 'Compare' : 'Through time'}</h1>
        <nav className="seg">
          <button className={screen.kind === 'library' ? 'on' : ''} onClick={() => s.openLibrary()}>
            <IconLibrary /> <span>Library</span>
          </button>
          <button
            className={screen.kind === 'compare' ? 'on' : ''}
            onClick={() => s.openCompare(here, screen.kind === 'compare' ? screen.b : { region: second.region.id, lineage: second.lineage.id })}
          >
            <IconCompare /> <span>Compare</span>
          </button>
        </nav>
        {screen.kind !== 'library' && (
          <button className="btn ex-town" onClick={() => s.closeScreen()}>
            Town
          </button>
        )}
      </header>
      <StudioContext.Provider value={studio}>
        {screen.kind === 'library' && <Library />}
        {screen.kind === 'building' && <BuildingView at={screen.ref} />}
        {screen.kind === 'compare' && <Compare a={screen.a} b={screen.b} />}
      </StudioContext.Provider>
    </div>
  );
}
