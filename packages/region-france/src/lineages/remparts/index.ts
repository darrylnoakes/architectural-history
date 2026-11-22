import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'remparts',
  name: 'Les Remparts',
  kind: 'defence',
  role: 'Placeholder',
  plotSize: [30, 16],
  stages: [
    {
      from: -300,
      def: {
        id: 'remparts-placeholder',
        name: 'Les Remparts',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(12, 4, 8.0, P.pierreBlonde);
          b.gable(12, 8.0, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
