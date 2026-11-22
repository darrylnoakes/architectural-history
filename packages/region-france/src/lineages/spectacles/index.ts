import type { Lineage } from '@ah/kit';
import { invasions } from '../../ends';
import { theatreAmphitheatre } from './01-theatre-amphitheatre';

const lineage: Lineage = {
  id: 'spectacles',
  name: 'Les Spectacles',
  kind: 'culture',
  role: 'Where the town goes to be entertained and improved: from a Gallo-Roman arena and a tennis court turned playhouse to a theatre, a museum, a circus, a library and two houses of culture.',
  plotSize: [40, 36],
  stages: [
    // Gallo-Roman theatre-amphitheatres were built from the later 1st century to the early 3rd
    { from: 80, builtUntil: 200, end: invasions, def: theatreAmphitheatre },
  ],
};

export default lineage;
