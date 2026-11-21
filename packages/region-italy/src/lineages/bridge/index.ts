import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'bridge',
  name: 'The Bridge',
  kind: 'crossing',
  role: 'Placeholder',
  plotSize: [16, 40],
  river: [-12, 12],
  stages: [
    {
      from: -750,
      def: {
        id: 'bridge-placeholder',
        name: 'The Bridge',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(8.0, 4, 20.0, P.intonacoOchre);
          b.gable(8.0, 20.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
