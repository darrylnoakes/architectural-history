import { formatYear } from '@ah/engine';
import type { BuildingDef, Lineage } from '@ah/kit';
import { useApp } from '../state';
import { Engine, region } from '../world/engine';
import { IconClose, IconLeft, IconRight, IconStreet } from './icons';
import { InfluenceIcon, influenceVerb } from './Timeline';

interface Current {
  lineage: Lineage;
  def: BuildingDef | null;
  from: number;
  to: number;
  prev: { year: number; name: string } | null;
  next: { year: number; name: string } | null;
  plotId: string;
  survivor: boolean;
  /** Empty plot: when the first building arrives. */
  firstYear?: number;
}

function useCurrent(): Current | null {
  const selected = useApp((s) => s.selected);
  const street = useApp((s) => s.street);
  const year = useApp((s) => s.year);
  useApp((s) => s.ready);
  const eng = Engine.instance;
  if (!eng) return null;
  if (street) {
    const lineage = eng.lineage(street.lineageId);
    if (!lineage) return null;
    let i = 0;
    lineage.stages.forEach((st, k) => {
      if (year >= st.from) i = k;
    });
    const st = lineage.stages[i];
    const p = lineage.stages[i - 1];
    const n = lineage.stages[i + 1];
    return {
      lineage,
      def: st.def,
      from: st.from,
      to: n ? n.from : Infinity,
      prev: p ? { year: p.from, name: p.def.name } : null,
      next: n ? { year: n.from, name: n.def.name } : null,
      plotId: street.plotId,
      survivor: false,
    };
  }
  if (!selected) return null;
  const p = eng.plotState(selected);
  if (!p) return null;
  const cur = eng.town.stageAt(p, year);
  if (!cur) {
    return { lineage: p.lineage, def: null, from: 0, to: 0, prev: null, next: null, plotId: p.plot.id, survivor: false, firstYear: p.schedule[0]?.from };
  }
  const name = (k: number) => p.lineage.stages[p.schedule[k].index].def.name;
  const i = cur.scheduleIndex;
  return {
    lineage: p.lineage,
    def: cur.def,
    from: cur.entry.from,
    to: cur.entry.to,
    prev: i > 0 ? { year: p.schedule[i - 1].from, name: name(i - 1) } : null,
    next: i + 1 < p.schedule.length ? { year: p.schedule[i + 1].from, name: name(i + 1) } : null,
    plotId: p.plot.id,
    survivor: !!p.plot.keep && cur.entry.to === Infinity && year - cur.entry.from > 120,
  };
}

export function Card() {
  const cur = useCurrent();
  const street = useApp((s) => s.street);
  const hover = useApp((s) => s.hoverFeature);
  const jumpTo = useApp((s) => s.jumpTo);
  const year = useApp((s) => s.year);
  if (!cur) return null;
  const { def, lineage } = cur;
  const ideas = (def?.influences ?? []).map((id) => region.influences.find((i) => i.id === id)).filter((i) => !!i);
  const multi = lineage.stages.length > 1;

  return (
    <aside className="panel card">
      <div className="panel-head">
        <div className="kicker">{lineage.name}</div>
        {!street && (
          <button className="icon-btn" onClick={() => useApp.getState().select(null)} aria-label="Close">
            <IconClose />
          </button>
        )}
      </div>
      {!def ? (
        <>
          <h2>Open ground</h2>
          <div className="scroll">
            <p>Nothing has been built on this plot yet. The town has not grown this far.</p>
            {cur.firstYear !== undefined && (
              <button className="btn" onClick={() => jumpTo(cur.firstYear!)}>
                Jump to {formatYear(cur.firstYear)}, when it is first built on
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h2>{def.name}</h2>
          <p className="tagline">
            {def.style} · {def.date}
          </p>
          <div className="scroll">
            <p className="stood">
              {street ? 'On the plot' : 'Stands here'} from {formatYear(cur.from)}
              {cur.to === Infinity ? ' to the present' : ` until ${formatYear(cur.to)}`}.
              {cur.survivor && ` A survivor: ${Math.round((year - cur.from) / 10) * 10} years old and still in use.`}
            </p>
            <p>{def.summary}</p>
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
