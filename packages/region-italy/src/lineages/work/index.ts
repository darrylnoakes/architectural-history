import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'work',
  name: 'The Workshop and the Factory',
  kind: 'work',
  role: 'Placeholder',
  plotSize: [36, 22],
  river: [-27, -11],
  stages: [
    {
      from: -750,
      def: {
        id: 'work-placeholder',
        name: 'The Workshop and the Factory',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(18.0, 4, 11.0, P.intonacoOchre);
          b.gable(18.0, 11.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
