import { formatYear } from '@ah/engine';
import { useApp } from '../state';
import { region, timeScale } from '../world/engine';
import { IconClose, IconLeft, IconRight } from './icons';
import { InfluenceIcon, influenceVerb } from './Timeline';

export function EraPanel() {
  const open = useApp((s) => s.eraOpen);
  const eraIndex = useApp((s) => timeScale.eraIndex(s.year));
  const jumpTo = useApp((s) => s.jumpTo);
  const street = useApp((s) => s.street);
  if (!open || street) return <div className="era-spacer" />;
  const era = region.eras[eraIndex];
  const ideas = region.influences.filter((i) => i.year >= era.from && i.year < era.to);
  const prev = region.eras[eraIndex - 1];
  const next = region.eras[eraIndex + 1];
  return (
    <aside className="panel era" key={era.id}>
      <div className="panel-head">
        <div className="kicker">
          {formatYear(era.from)} to {formatYear(era.to)}
        </div>
        <button className="icon-btn" onClick={() => useApp.setState({ eraOpen: false })} aria-label="Close era notes">
          <IconClose />
        </button>
      </div>
      <h2>{era.name}</h2>
      <p className="tagline">{era.tagline}</p>
      <div className="scroll">
        <p>{era.summary}</p>
        <h3>What to look for</h3>
        <ul className="traits">
          {era.traits.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h3>Built from</h3>
        <div className="chips">
          {era.materials.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        {ideas.length > 0 && (
          <>
            <h3 className="with-link">
              Ideas on the move
              <button onClick={() => useApp.setState({ ideasOpen: true })}>See all</button>
            </h3>
            <ul className="ideas">
              {ideas.map((i) => (
                <li key={i.id}>
                  <button className={`badge dir-${i.dir}`} onClick={() => jumpTo(i.year)}>
                    <InfluenceIcon dir={i.dir} /> {influenceVerb(i)} · {formatYear(i.year)}
                  </button>
                  <strong>{i.title}</strong>
                  <p>{i.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="pager">
        <button disabled={!prev} onClick={() => prev && jumpTo(prev.from)}>
          <IconLeft /> {prev?.name ?? 'Start'}
        </button>
        <button disabled={!next} onClick={() => next && jumpTo(next.from)}>
          {next?.name ?? 'Today'} <IconRight />
        </button>
      </div>
    </aside>
  );
}
