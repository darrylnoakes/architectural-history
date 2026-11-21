import { formatYear } from '@ah/engine';
import type { BuildingDef, Lineage, StageEnd } from '@ah/kit';
import { useApp } from '../state';
import { Engine, region } from '../world/engine';
import { IconClose, IconLeft, IconRight, IconStreet } from './icons';
import { InfluenceIcon, influenceVerb } from './Timeline';

interface Step {
  year: number;
  name: string;
}

interface Current {
  lineage: Lineage;
  plotId: string;
  /** standing = in use; ruin = abandoned; open = nothing on the plot. */
  kind: 'standing' | 'ruin' | 'open';
  /** The building standing or ruined; for open ground, what stood here last (if anything). */
  def: BuildingDef | null;
  from: number;
  to: number;
  /** How the building's time ended, when it was not simply replaced. */
  end?: StageEnd;
  prev: Step | null;
  next: Step | null;
  survivor: boolean;
}

function useCurrent(): Current | null {
  const selected = useApp((s) => s.selected);
  const street = useApp((s) => s.street);
  const year = useApp((s) => s.year);
  useApp((s) => s.ready);
  const eng = Engine.instance;
  if (!eng) return null;

  if (street) {
    // the lineage street shows every stage in use, in its own right
    const lineage = eng.lineage(street.lineageId);
    if (!lineage) return null;
    let i = 0;
    lineage.stages.forEach((st, k) => {
      if (year >= st.from) i = k;
    });
    const st = lineage.stages[i];
    const p = lineage.stages[i - 1];
    const n = lineage.stages[i + 1];
    const cut = st.end && st.end.fate !== 'renew' && (!n || st.end.year < n.from) ? st.end : undefined;
    return {
      lineage,
      plotId: street.plotId,
      kind: 'standing',
      def: st.def,
      from: st.from,
      to: cut ? cut.year : n ? n.from : Infinity,
      end: cut,
      prev: p ? { year: p.from, name: p.def.name } : null,
      next: n ? { year: n.from, name: n.def.name } : null,
      survivor: false,
    };
  }

  if (!selected) return null;
  const p = eng.plotState(selected);
  if (!p) return null;
  const st = eng.town.status(p, year);
  const step = (k: number): Step | null => (k >= 0 && k < p.schedule.length ? { year: p.schedule[k].from, name: eng.town.entryName(p, k) } : null);

  if (st.kind === 'open') {
    const last = st.before >= 0 ? p.schedule[st.before] : null;
    const lastStage = last ? p.lineage.stages[last.index] : null;
    return {
      lineage: p.lineage,
      plotId: p.plot.id,
      kind: 'open',
      def: lastStage?.def ?? null,
      from: last ? last.to : region.start,
      to: st.after >= 0 ? p.schedule[st.after].from : Infinity,
      end: lastStage?.end,
      prev: step(st.before),
      next: step(st.after),
      survivor: false,
    };
  }
  const i = st.scheduleIndex;
  return {
    lineage: p.lineage,
    plotId: p.plot.id,
    kind: st.kind,
    def: st.def,
    from: st.entry.from,
    to: st.entry.to,
    end: st.stage.end,
    prev: step(i - 1),
    next: step(i + 1),
    survivor: st.kind === 'standing' && !!p.plot.keep && st.entry.to === Infinity && year - st.entry.from > 120,
  };
}

export function Card() {
  const cur = useCurrent();
  const street = useApp((s) => s.street);
  const hover = useApp((s) => s.hoverFeature);
  const jumpTo = useApp((s) => s.jumpTo);
  const year = useApp((s) => s.year);
  if (!cur) return null;
  const { def, lineage, kind } = cur;
  const ideas = (def?.influences ?? []).map((id) => region.influences.find((i) => i.id === id)).filter((i) => !!i);
  const multi = lineage.stages.length > 1;
  const until = cur.to === Infinity ? null : formatYear(cur.to);

  return (
    <aside className={`panel card kind-${kind}`}>
      <div className="panel-head">
        <div className="kicker">{lineage.name}</div>
        {!street && (
          <button className="icon-btn" onClick={() => useApp.getState().select(null)} aria-label="Close">
            <IconClose />
          </button>
        )}
      </div>

      {kind === 'open' && (
        <>
          <h2>{def ? 'Cleared ground' : 'Open ground'}</h2>
          <div className="scroll">
            {def ? (
              <>
                <p className="stood">
                  The {def.name.toLowerCase()} stood here until {formatYear(cur.from)}.
                  {until ? ` Nothing is built on the plot again until ${until}.` : ''}
                </p>
                {cur.end?.note && <p>{cur.end.note}</p>}
              </>
            ) : (
              <p>Nothing has been built on this plot yet. The town has not grown this far.</p>
            )}
            {cur.next && (
              <button className="btn" onClick={() => jumpTo(cur.next!.year)}>
                Jump to {formatYear(cur.next.year)}: {cur.next.name}
              </button>
            )}
          </div>
        </>
      )}

      {kind === 'ruin' && def && (
        <>
          <h2>{def.name}</h2>
          <p className="tagline">In ruins · abandoned {formatYear(cur.from)}</p>
          <div className="scroll">
            <p className="stood">
              Roofless and decaying from {formatYear(cur.from)}
              {until ? ` until ${until}, when the plot is built on again.` : '.'}
            </p>
            {cur.end?.note && <p>{cur.end.note}</p>}
            <h3>What it was</h3>
            <p>{def.summary}</p>
          </div>
        </>
      )}

      {kind === 'standing' && def && (
        <>
          <h2>{def.name}</h2>
          <p className="tagline">
            {def.style} · {def.date}
          </p>
          <div className="scroll">
            <p className="stood">
              {street ? 'On the plot' : 'Stands here'} from {formatYear(cur.from)}
              {until ? ` until ${until}.` : ' to the present.'}
              {cur.survivor && ` A survivor: about ${Math.round((year - cur.from) / 10) * 10} years old and still in use.`}
            </p>
            <p>{def.summary}</p>
            {street && cur.end?.note && <p>{cur.end.note}</p>}
            {def.modelledOn && <p className="modelled">Modelled on: {def.modelledOn}</p>}
            <h3>What to look for</h3>
            <ol className="lookfor">
              {def.lookFor.map((f, i) => (
                <li
                  key={f.label}
                  className={hover === i ? 'hot' : ''}
                  onPointerEnter={() => useApp.setState({ hoverFeature: i })}
                  onPointerLeave={() => useApp.setState({ hoverFeature: null })}
                  onClick={() => useApp.setState({ hoverFeature: i })}
                >
                  <span className="n">{i + 1}</span>
                  <div>
                    <strong>{f.label}</strong>
                    <p>{f.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            {def.materials.length > 0 && (
              <>
                <h3>Built from</h3>
                <div className="chips">
                  {def.materials.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </>
            )}
            {ideas.length > 0 && (
              <>
                <h3>Where the ideas came from</h3>
                <ul className="ideas">
                  {ideas.map((i) => (
                    <li key={i!.id}>
                      <span className={`badge dir-${i!.dir}`}>
                        <InfluenceIcon dir={i!.dir} /> {influenceVerb(i!)} · {formatYear(i!.year)}
                      </span>
                      <strong>{i!.title}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}

      {multi && (
        <div className="card-foot">
          <div className="pager">
            <button disabled={!cur.prev} onClick={() => cur.prev && jumpTo(cur.prev.year)} title={cur.prev?.name}>
              <IconLeft /> <span>{cur.prev ? `Before: ${cur.prev.name}` : 'The first'}</span>
            </button>
            <button disabled={!cur.next} onClick={() => cur.next && jumpTo(cur.next.year)} title={cur.next?.name}>
              <span>{cur.next ? `After: ${cur.next.name}` : 'The latest'}</span> <IconRight />
            </button>
          </div>
          {!street && (
            <button className="btn primary" onClick={() => useApp.getState().openStreet(cur.plotId, lineage.id)}>
              <IconStreet /> Line them all up: the lineage street
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
