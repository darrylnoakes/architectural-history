import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'duomo',
  name: 'The Temple and the Cathedral',
  kind: 'worship',
  role: 'Placeholder',
  plotSize: [32, 60],
  stages: [
    {
      from: -750,
      def: {
        id: 'duomo-placeholder',
        name: 'The Temple and the Cathedral',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(16.0, 4, 30.0, P.intonacoOchre);
          b.gable(16.0, 30.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
