import type { Lineage } from '@ah/kit';
import { theatreAmphitheatre } from './01-theatre-amphitheatre';
import { jeuDePaume } from './02-jeu-de-paume';
import { grandTheatre } from './03-grand-theatre';
import { museum } from './04-museum';
import { cirque } from './05-cirque';
import { carnegieLibrary } from './06-carnegie-library';
import { maisonDeLaCulture } from './07-maison-de-la-culture';
import { artCentre } from './08-art-centre';

const lineage: Lineage = {
  id: 'spectacles',
  name: 'Les Spectacles',
  kind: 'culture',
  role: 'Where the town goes to be entertained and improved: from a Gallo-Roman arena and a tennis court turned playhouse to a theatre, a museum, a circus, a library and two houses of culture.',
  plotSize: [40, 36],
  stages: [
    // Gallo-Roman theatre-amphitheatres were built from the later 1st century to the early 3rd
    {
      from: 80,
      builtUntil: 200,
      // not left as a ruin like the forum: it lay outside the new wall and was its nearest quarry
      end: {
        year: 290,
        fate: 'cleared',
        note:
          'Burned in the raids of 275 and 276, the theatre was then taken down block by block for the town wall of about 290, as the arena of Paris was. ' +
          'Only the hollow of the arena was left, under gardens and sheds.',
      },
      def: theatreAmphitheatre,
    },
    // covered tennis courts multiplied from the mid-16th century; few were built after about 1650,
    // and many were turned into playhouses or warehouses as the game went out of fashion
    { from: 1560, builtUntil: 1650, def: jeuDePaume },
    { from: 1780, def: grandTheatre },
    { from: 1862, def: museum },
    // permanent circuses went up in French towns from the 1850s to the eve of the Great War
    { from: 1889, builtUntil: 1910, def: cirque },
    // the libraries and public buildings of the Reconstruction, in Art Deco dress, until the next war
    { from: 1927, builtUntil: 1939, def: carnegieLibrary },
    // Malraux's maisons de la culture opened from 1961 (Le Havre) to the mid-1970s
    { from: 1966, builtUntil: 1975, def: maisonDeLaCulture },
    { from: 2010, def: artCentre },
  ],
};

export default lineage;
