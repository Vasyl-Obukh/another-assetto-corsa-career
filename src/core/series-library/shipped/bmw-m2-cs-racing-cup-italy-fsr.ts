import { BMW_M2_CS_RACING_CUP_ITALY } from './bmw-m2-cs-racing-cup-italy.ts';
import { reclassed } from './utils.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * BMW M2 CS Racing Cup Italy - BMW's one-make series on the Italian
 * championship events, on First Studio Race's M2 CS Racing.
 *
 * The same series as BMW_M2_CS_RACING_CUP_ITALY, its calendar, format and
 * field, on FSR's M2 CS Racing instead of Guerilla's. A copy rather than
 * another car in the original, because FSR's cars never share a class with
 * another maker's and the original keeps racing without them. Two races a
 * round. The calendar is the Italian circuits the series races - Vallelunga,
 * Imola, Mugello, Monza and Misano - rather than one season's, which was not
 * checked. Both races line up on qualifying, and the 25-minute length and the
 * 25-18-15 scale are stand-ins: the series' own format and table were not
 * checked. The field is invented, the original's.
 *
 * Source: https://www.bmw-motorsport.com/
 */
export const BMW_M2_CS_RACING_CUP_ITALY_FSR: Championship = {
  ...BMW_M2_CS_RACING_CUP_ITALY,
  id: 'bmw-m2-cs-racing-cup-italy-fsr',
  name: 'BMW M2 CS Racing Cup Italy (FSR)',
  description: {
    en: 'BMW\'s Italian one-make series on First Studio Race\'s M2 CS Racing: two races a round at '
      + 'Vallelunga, Imola, Mugello, Monza and Misano.',
    uk: 'Італійський монокубок BMW на M2 CS Racing від First Studio Race: дві гонки за етап у '
      + 'Валлелунзі, Імолі, Муджелло, Монці та Мізано.',
  },
  entries: reclassed(BMW_M2_CS_RACING_CUP_ITALY, { kind: 'cars', cars: ['fsr_bmw_m2_cs_racing'] }),
};
