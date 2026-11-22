import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'hotel',
  name: 'L’Hôtel',
  kind: 'elite',
  role: 'Placeholder',
  plotSize: [24, 26],
  stages: [
    {
      from: -300,
      def: {
        id: 'hotel-placeholder',
        name: 'L’Hôtel',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(12.0, 4, 12, P.pierreBlonde);
          b.gable(12.0, 12, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
