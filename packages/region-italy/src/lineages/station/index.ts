import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'station',
  name: 'The Station',
  kind: 'transport',
  role: 'Placeholder',
  plotSize: [40, 24],
  stages: [
    {
      from: -750,
      def: {
        id: 'station-placeholder',
        name: 'The Station',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(20.0, 4, 12.0, P.intonacoOchre);
          b.gable(20.0, 12.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
