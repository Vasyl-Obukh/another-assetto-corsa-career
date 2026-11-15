import { reclassedBy } from './utils.ts';
import { WEC_2025_LFM } from './wec-2025-lfm.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship, Eligibility } from '../../../shared/types/index.ts';

/**
 * What each class races, by class id.
 */
const CARS: Readonly<Record<string, Eligibility>> = {
  hypercar: { kind: 'spec', spec: CarSpec.LMH_RSS },
  lmgt3: { kind: 'spec', spec: CarSpec.GT3_RSS },
};

/**
 * FIA World Endurance Championship, 2025 - on RSS's cars.
 *
 * The same season as WEC_2025_LFM, its calendar, formats, points and field,
 * with RSS's cars in both classes. A copy rather than more cars in the
 * original, because RSS's cars never share a class with another maker's and
 * the original keeps racing LFM's. Hypercar is the Hypercar (RSS) spec, the
 * MP-H Bayer, Callahan, Lanzo and Protech standing for the BMW, Cadillac,
 * Lamborghini and Porsche; LMGT3 is the GT3 (RSS) spec, RSS's GT-M cars, their
 * GT3s under made-up names.
 *
 * Source: https://en.wikipedia.org/wiki/2025_FIA_World_Endurance_Championship
 */
export const WEC_2025_RSS: Championship = {
  ...WEC_2025_LFM,
  id: 'wec-2025-rss',
  name: 'World Endurance Championship 2025 (RSS)',
  description: {
    en: 'The 2025 World Endurance Championship on RSS\'s cars, MP-H hypercars and GT-M cars in '
      + 'LMGT3: eight rounds at their real lengths, Le Mans at double points.',
    uk: 'Чемпіонат світу з гонок на витривалість 2025 року на машинах RSS, гіперкарах MP-H і GT-M у '
      + 'LMGT3: вісім етапів у реальній тривалості, Ле-Ман із подвійними очками.',
  },
  entries: reclassedBy(WEC_2025_LFM, CARS),
};
