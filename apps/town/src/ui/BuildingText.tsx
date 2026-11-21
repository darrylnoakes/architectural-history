import { formatYear } from '@ah/engine';
import type { BuildingDef, Region } from '@ah/kit';
import { InfluenceIcon, influenceVerb } from './Timeline';

/** The learner-facing text of one building: what it is, what to look for, what it is made of. */
export function BuildingText({ def, region }: { def: BuildingDef; region: Region }) {
  const ideas = (def.influences ?? []).map((id) => region.influences.find((i) => i.id === id)).filter((i) => !!i);
  return (
    <>
      <p>{def.summary}</p>
      {def.modelledOn && <p className="modelled">Modelled on: {def.modelledOn}</p>}
      <h3>What to look for</h3>
      <ol className="lookfor">
        {def.lookFor.map((f, i) => (
          <li key={f.label}>
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
    </>
  );
}
