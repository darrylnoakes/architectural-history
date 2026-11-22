import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'pont',
  name: 'Le Pont',
  kind: 'crossing',
  role: 'Placeholder',
  plotSize: [16, 40],
  river: [-12, 12],
  stages: [
    {
      from: -300,
      def: {
        id: 'pont-placeholder',
        name: 'Le Pont',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(8.0, 4, 12, P.pierreBlonde);
          b.gable(8.0, 12, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
