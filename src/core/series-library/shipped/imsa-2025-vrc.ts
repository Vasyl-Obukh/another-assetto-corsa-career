import { IMSA_2025 } from './imsa-2025.ts';
import { reclassedBy } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * IMSA WeatherTech SportsCar Championship, 2025 - GTP on VRC's hypercars.
 *
 * The same season as IMSA_2025, its calendar, formats, points and field, with
 * GTP on the Hypercar (VRC) spec, the cars WEC_2025_VRC races - there are too
 * few modern hypercars for each series to race its own. A copy rather than
 * more cars in the original, because VRC's hypercars never share a class with
 * another maker's and the original keeps racing LFM's. LMP2 and GTD are the
 * original's, since VRC has neither.
 *
 * Source: https://en.wikipedia.org/wiki/2025_IMSA_SportsCar_Championship
 */
export const IMSA_2025_VRC: Championship = {
  ...IMSA_2025,
  id: 'imsa-2025-vrc',
  name: 'IMSA SportsCar Championship 2025 (VRC)',
  description: {
    en: 'America\'s sports car championship of 2025 on VRC\'s hypercars in GTP, with the Oreca 07 in '
      + 'LMP2 and LFM\'s GT3s in GTD: eight rounds from the Rolex 24 to Petit Le Mans.',
    uk: 'Американський чемпіонат спортивних машин 2025 року на гіперкарах VRC у GTP, з Oreca 07 у LMP2 '
      + 'та GT3 від LFM у GTD: вісім етапів від Rolex 24 до Petit Le Mans.',
  },
  entries: reclassedBy(IMSA_2025, { gtp: { kind: 'spec', spec: CarSpec.LMH_VRC } }),
};
