import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'atelier',
  name: 'L’Atelier',
  kind: 'work',
  role: 'Placeholder',
  plotSize: [36, 22],
  river: [-27, -11],
  stages: [
    {
      from: -300,
      def: {
        id: 'atelier-placeholder',
        name: 'L’Atelier',
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
