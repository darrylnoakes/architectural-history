import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'gare',
  name: 'La Gare',
  kind: 'transport',
  role: 'Placeholder',
  plotSize: [40, 24],
  stages: [
    {
      from: -300,
      def: {
        id: 'gare-placeholder',
        name: 'La Gare',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(12, 4, 12.0, P.pierreBlonde);
          b.gable(12, 12.0, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
