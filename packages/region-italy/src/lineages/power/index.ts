import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'power',
  name: 'The Seat of Power',
  kind: 'power',
  role: 'Placeholder',
  plotSize: [44, 44],
  stages: [
    {
      from: -750,
      def: {
        id: 'power-placeholder',
        name: 'The Seat of Power',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(22.0, 4, 22.0, P.intonacoOchre);
          b.gable(22.0, 22.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
