import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'osteria',
  name: 'The Osteria',
  kind: 'hospitality',
  role: 'Placeholder',
  plotSize: [22, 22],
  stages: [
    {
      from: -750,
      def: {
        id: 'osteria-placeholder',
        name: 'The Osteria',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(11.0, 4, 11.0, P.intonacoOchre);
          b.gable(11.0, 11.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
