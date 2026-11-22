import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'maison',
  name: 'La Maison',
  kind: 'home',
  role: 'Placeholder',
  plotSize: [14, 18],
  stages: [
    {
      from: -300,
      def: {
        id: 'maison-placeholder',
        name: 'La Maison',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(7.0, 4, 9.0, P.pierreBlonde);
          b.gable(7.0, 9.0, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
