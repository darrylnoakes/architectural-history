import { P, type Lineage } from '@ah/kit';

// PLACEHOLDER: replaced by the real lineage.
const lineage: Lineage = {
  id: 'market',
  name: 'The Market',
  kind: 'market',
  role: 'Placeholder',
  plotSize: [26, 22],
  stages: [
    {
      from: -750,
      def: {
        id: 'market-placeholder',
        name: 'The Market',
        style: 'Placeholder',
        date: 'n/a',
        summary: 'Placeholder building.',
        materials: [],
        lookFor: [],
        build(b) {
          b.box(13.0, 4, 11.0, P.intonacoOchre);
          b.gable(13.0, 11.0, 2, P.coppi, { at: [0, 4, 0], overhang: 0.3 });
        },
      },
    },
  ],
};

export default lineage;
