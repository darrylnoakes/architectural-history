import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'palazzo',
  name: 'The Palazzo',
  kind: 'elite',
  role: 'Placeholder',
  plotSize: [24, 26],
  stages: [
    {
      from: -750,
      def: {
        id: 'palazzo-placeholder',
        name: 'The Palazzo',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(12.0, 4, 13.0, P.intonacoOchre);
          b.gable(12.0, 13.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
