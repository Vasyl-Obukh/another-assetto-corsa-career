import { reclassedBy } from './utils.ts';
import { WEC_2025_LFM } from './wec-2025-lfm.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship, Eligibility } from '../../../shared/types/index.ts';

/**
 * What each class races, by class id.
 */
const CARS: Readonly<Record<string, Eligibility>> = {
  hypercar: { kind: 'cars', cars: ['urd_akuma_axr006', 'urd_bayro_m_hybrid_v8', 'urd_dallas_vsr_hybrid'] },
  lmgt3: { kind: 'spec', spec: CarSpec.GT3_URD },
};

/**
 * FIA World Endurance Championship, 2025 - on URD's cars.
 *
 * The same season as WEC_2025_LFM, its calendar, formats, points and field,
 * with URD's cars in both classes. A copy rather than more cars in the
 * original, because URD's cars never share a class with another maker's and
 * the original keeps racing without them. Hypercar is URD's LMDh cars, the ones
 * IMSA_2025_URD races in GTP: the Bayro and Dallas standing for the BMW and
 * Cadillac that raced, and the Akuma for the Acura, an IMSA car - there are
 * too few modern hypercars for each series to race its own; LMGT3 is the GT3
 * (URD) spec - URD's Aston Martin, BMW, Corvette, Ferrari, Ford, Lexus and
 * Porsche.
 *
 * Source: https://en.wikipedia.org/wiki/2025_FIA_World_Endurance_Championship
 */
export const WEC_2025_URD: Championship = {
  ...WEC_2025_LFM,
  id: 'wec-2025-urd',
  name: 'World Endurance Championship 2025 (URD)',
  description: {
    en: 'The 2025 World Endurance Championship on URD\'s hypercars and GT3s: eight rounds at their '
      + 'real lengths, Le Mans at double points.',
    uk: 'Чемпіонат світу з гонок на витривалість 2025 року на гіперкарах і GT3 від URD: вісім етапів у '
      + 'реальній тривалості, Ле-Ман із подвійними очками.',
  },
  entries: reclassedBy(WEC_2025_LFM, CARS),
};
