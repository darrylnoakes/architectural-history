import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'auberge',
  name: 'L’Auberge',
  kind: 'hospitality',
  role: 'Placeholder',
  plotSize: [22, 22],
  stages: [
    {
      from: -300,
      def: {
        id: 'auberge-placeholder',
        name: 'L’Auberge',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(11.0, 4, 11.0, P.pierreBlonde);
          b.gable(11.0, 11.0, 2, P.ardoise, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
