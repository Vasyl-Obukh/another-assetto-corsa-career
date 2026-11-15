import { IMSA_2025 } from './imsa-2025.ts';
import { reclassedBy } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship, Eligibility } from '../../../shared/types/index.ts';

/**
 * What each class races, by class id.
 */
const CARS: Readonly<Record<string, Eligibility>> = {
  gtp: { kind: 'spec', spec: CarSpec.LMH_RSS },
  lmp2: { kind: 'cars', cars: ['acf_oreca_07'] },
  gtd: { kind: 'spec', spec: CarSpec.GT3_RSS },
};

/**
 * IMSA WeatherTech SportsCar Championship, 2025 - on RSS's cars.
 *
 * The same season as IMSA_2025, its calendar, formats, points and field, with
 * RSS's cars where RSS has them. A copy rather than more cars in the original,
 * because RSS's cars never share a class with another maker's and the
 * original keeps racing without them. GTP is the Hypercar (RSS) spec, the MP-H
 * Bayer, Callahan, Lanzo and Protech standing for the BMW, Cadillac,
 * Lamborghini and Porsche; GTD is the GT3 (RSS) spec, RSS's GT-M cars, their
 * GT3s under made-up names. RSS has no LMP2, so LMP2 is LFM's Oreca 07 alone.
 *
 * Source: https://en.wikipedia.org/wiki/2025_IMSA_SportsCar_Championship
 */
export const IMSA_2025_RSS: Championship = {
  ...IMSA_2025,
  id: 'imsa-2025-rss',
  name: 'IMSA SportsCar Championship 2025 (RSS)',
  description: {
    en: 'America\'s sports car championship of 2025 on RSS\'s MP-H hypercars in GTP and GT-M cars in '
      + 'GTD, with LFM\'s Oreca 07 in LMP2: eight rounds from the Rolex 24 to Petit Le Mans.',
    uk: 'Американський чемпіонат спортивних машин 2025 року на гіперкарах MP-H від RSS у GTP і машинах '
      + 'GT-M у GTD, з Oreca 07 від LFM у LMP2: вісім етапів від Rolex 24 до Petit Le Mans.',
  },
  entries: reclassedBy(IMSA_2025, CARS),
};
