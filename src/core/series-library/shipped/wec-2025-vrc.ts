import { reclassedBy } from './utils.ts';
import { WEC_2025_LFM } from './wec-2025-lfm.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * FIA World Endurance Championship, 2025 - the Hypercar class on VRC's
 * Prototype H cars, LMGT3 on LFM's.
 *
 * The same season as WEC_2025_LFM, its calendar, formats, points, field and
 * LMGT3 class, with Hypercar on the Hypercar (VRC) spec: the Pageau 9T8,
 * Alpine A424, Cadenza V, Ferrenzo P49 and Isola Santini, standing for the
 * Peugeot, Alpine, Cadillac, Ferrari and Isotta Fraschini hypercars of 2024. A
 * copy rather than more cars in the original, because VRC's hypercars never
 * share a class with another maker's. VRC has no GT3, so LMGT3 stays LFM's.
 *
 * Source: https://en.wikipedia.org/wiki/2025_FIA_World_Endurance_Championship
 */
export const WEC_2025_VRC: Championship = {
  ...WEC_2025_LFM,
  id: 'wec-2025-vrc',
  name: 'World Endurance Championship 2025 (VRC)',
  description: {
    en: 'The 2025 World Endurance Championship on VRC\'s Prototype H hypercars and LFM\'s LMGT3s: '
      + 'eight rounds at their real lengths, Le Mans at double points.',
    uk: 'Чемпіонат світу з гонок на витривалість 2025 року на гіперкарах Prototype H від VRC і LMGT3 '
      + 'від LFM: вісім етапів у реальній тривалості, Ле-Ман із подвійними очками.',
  },
  entries: reclassedBy(WEC_2025_LFM, { hypercar: { kind: 'spec', spec: CarSpec.LMH_VRC } }),
};
