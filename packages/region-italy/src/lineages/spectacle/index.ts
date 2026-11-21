import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'spectacle',
  name: 'Spectacle',
  kind: 'culture',
  role: 'Placeholder',
  plotSize: [40, 36],
  stages: [
    {
      from: -750,
      def: {
        id: 'spectacle-placeholder',
        name: 'Spectacle',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(20.0, 4, 18.0, P.intonacoOchre);
          b.gable(20.0, 18.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
