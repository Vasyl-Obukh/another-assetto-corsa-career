import { PRAGA_CUP_2022_FSR } from './praga-cup-2022-fsr.ts';
import { reclassed } from './utils.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * Praga Cup, 2022 - on the Tripl3 Pack's Praga R1.
 *
 * The same season as PRAGA_CUP_2022_FSR, its calendar, formats, points and
 * field, on Kunos' car. A copy rather than both cars in one class, because
 * the two are R1s of different years and never share a grid. Kunos' R1 is the
 * car of the R1's launch, standing in for the 2021 and 2022 cars - the R1T -
 * that made up the 2022 grid.
 *
 * Source: https://en.wikipedia.org/wiki/2022_Praga_Cup
 */
export const PRAGA_CUP_2022: Championship = {
  ...PRAGA_CUP_2022_FSR,
  id: 'praga-cup-2022',
  name: 'Praga Cup 2022',
  description: {
    en: 'Praga\'s one-make series of 2022 on the Tripl3 Pack\'s Praga R1: two one-hour races a meeting '
      + 'on the Britcar bill at British circuits.',
    uk: 'Монокубок Praga 2022 року на Praga R1 з Tripl3 Pack: дві годинні гонки за етап у програмі '
      + 'Britcar на британських трасах.',
  },
  entries: reclassed(PRAGA_CUP_2022_FSR, { kind: 'cars', cars: ['ks_praga_r1'] }),
};
