import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'home',
  name: 'The Family Home',
  kind: 'home',
  role: 'Placeholder',
  plotSize: [14, 18],
  stages: [
    {
      from: -750,
      def: {
        id: 'home-placeholder',
        name: 'The Family Home',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(7.0, 4, 9.0, P.intonacoOchre);
          b.gable(7.0, 9.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
