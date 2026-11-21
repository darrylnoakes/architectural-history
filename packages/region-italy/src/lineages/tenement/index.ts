import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'tenement',
  name: 'The Tenement',
  kind: 'workers',
  role: 'Placeholder',
  plotSize: [26, 16],
  stages: [
    {
      from: -750,
      def: {
        id: 'tenement-placeholder',
        name: 'The Tenement',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(13.0, 4, 8.0, P.intonacoOchre);
          b.gable(13.0, 8.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
