import { useEffect, useMemo, useRef, useState } from 'react';
import { formatYear } from '@ah/engine';
import type { Influence } from '@ah/kit';
import { useApp } from '../state';
import { useRegion } from './useRegion';
import { IconClose } from './icons';
import { InfluenceIcon, influenceVerb } from './Timeline';

type Filter = 'all' | Influence['dir'];
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'Arriving' },
  { id: 'out', label: 'Leaving' },
  { id: 'home', label: 'Home-grown' },
];
const css = (n: number) => '#' + n.toString(16).padStart(6, '0');

/** Every cross-pollination entry in one list, in date order. Choosing one takes the town to that year. */
export function IdeasDialog() {
  const open = useApp((s) => s.ideasOpen);
  const year = useApp((s) => s.year);
  const [filter, setFilter] = useState<Filter>('all');
  const list = useRef<HTMLDivElement>(null);
  const { region, timeScale } = useRegion();
  const sorted = useMemo(() => [...region.influences].sort((a, b) => a.year - b.year), [region]);
  // the entry nearest the current year, so the list opens where you are in the story
  const nearest = useMemo(
    () => sorted.reduce((best, i) => (Math.abs(i.year - year) < Math.abs(best.year - year) ? i : best), sorted[0]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  useEffect(() => {
    if (!open) return;
    // scroll the list itself: scrollIntoView would also drag the whole page along with it
    const box = list.current;
    const row = box?.querySelector<HTMLElement>('.idea-row.near');
    if (box && row) {
      const delta = row.getBoundingClientRect().top - box.getBoundingClientRect().top;
      box.scrollTop += delta - box.clientHeight / 2 + row.clientHeight / 2;
    }
  }, [open]);

  if (!open) return null;
  const close = () => useApp.setState({ ideasOpen: false });
  const shown = sorted.filter((i) => filter === 'all' || i.dir === filter);
  const go = (i: Influence) => {
    useApp.setState({ ideasOpen: false, eraOpen: window.innerWidth > 900 });
    useApp.getState().jumpTo(i.year);
  };
  let lastEra = '';

  return (
    <div className="modal-back" onClick={close}>
      <div className="modal panel ideas-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Ideas on the move">
        <div className="panel-head">
          <div>
            <div className="kicker">Cross-pollination</div>
            <h2>Ideas on the move</h2>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <p className="ideas-lede">
          Styles rarely start where they end up. These are the ideas that reached {region.name} from elsewhere, and the ones it
          sent out. Choose one to go to that year.
        </p>
        <div className="seg" role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="scroll" ref={list}>
          {shown.map((i) => {
            const era = timeScale.era(i.year);
            const head = era.id !== lastEra;
            lastEra = era.id;
            return (
              <div key={i.id}>
                {head && (
                  <div className="idea-era">
                    <span style={{ background: css(era.color) }} /> {era.name}
                  </div>
                )}
                <button className={`idea-row${i.id === nearest.id ? ' near' : ''}`} onClick={() => go(i)}>
                  <span className="idea-year">{formatYear(i.year)}</span>
                  <span className="idea-body">
                    <span className={`badge dir-${i.dir}`}>
                      <InfluenceIcon dir={i.dir} /> {influenceVerb(i)}
                    </span>
                    <strong>{i.title}</strong>
                    <span className="idea-text">{i.text}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
