import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'halles',
  name: 'Les Halles',
  kind: 'market',
  role: 'Placeholder',
  plotSize: [26, 22],
  stages: [
    {
      from: -300,
      def: {
        id: 'halles-placeholder',
        name: 'Les Halles',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(12, 4, 11.0, P.pierreBlonde);
          b.gable(12, 11.0, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
