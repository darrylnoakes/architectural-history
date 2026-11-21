import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'walls',
  name: 'Walls and Gates',
  kind: 'defence',
  role: 'Placeholder',
  plotSize: [30, 16],
  stages: [
    {
      from: -750,
      def: {
        id: 'walls-placeholder',
        name: 'Walls and Gates',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(15.0, 4, 8.0, P.intonacoOchre);
          b.gable(15.0, 8.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
