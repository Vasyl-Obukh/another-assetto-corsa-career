import { ELMS_2025 } from './elms-2025.ts';
import { reclassedBy } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship, Eligibility } from '../../../shared/types/index.ts';

/**
 * What each class races, by class id.
 */
const CARS: Readonly<Record<string, Eligibility>> = {
  lmp2: { kind: 'cars', cars: ['acf_oreca_07'] },
  lmgt3: { kind: 'spec', spec: CarSpec.GT3_RSS },
};

/**
 * European Le Mans Series, 2025 - LMGT3 on RSS's GT-M cars, LMP2 on LFM's.
 *
 * The same season as ELMS_2025, its calendar, formats, points and field, with
 * LMGT3 on the GT3 (RSS) spec: RSS's GT-M cars, their GT3s under made-up
 * names. A copy rather than more cars in the original, because RSS's GT3s
 * never share a class with another maker's and the original keeps racing
 * LFM's. RSS has no LMP2, so LMP2 is LFM's Oreca 07 alone.
 *
 * Source: https://en.wikipedia.org/wiki/2025_European_Le_Mans_Series
 */
export const ELMS_2025_RSS: Championship = {
  ...ELMS_2025,
  id: 'elms-2025-rss',
  name: 'European Le Mans Series 2025 (RSS)',
  description: {
    en: 'Europe\'s endurance series of 2025 on LFM\'s Oreca 07 in LMP2 and RSS\'s GT-M cars in '
      + 'LMGT3: six four-hour races.',
    uk: 'Європейська серія гонок на витривалість 2025 року на Oreca 07 від LFM у LMP2 та машинах GT-M '
      + 'від RSS у LMGT3: шість чотиригодинних гонок.',
  },
  entries: reclassedBy(ELMS_2025, CARS),
};
