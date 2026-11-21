import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'fountain',
  name: 'The Fountain',
  kind: 'culture',
  role: 'Placeholder',
  plotSize: [12, 12],
  stages: [
    {
      from: -750,
      def: {
        id: 'fountain-placeholder',
        name: 'The Fountain',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(6.0, 4, 6.0, P.intonacoOchre);
          b.gable(6.0, 6.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
