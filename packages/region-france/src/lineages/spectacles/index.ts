import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'spectacles',
  name: 'Les Spectacles',
  kind: 'culture',
  role: 'Placeholder',
  plotSize: [40, 36],
  stages: [
    {
      from: -300,
      def: {
        id: 'spectacles-placeholder',
        name: 'Les Spectacles',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(12, 4, 12, P.pierreBlonde);
          b.gable(12, 12, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
