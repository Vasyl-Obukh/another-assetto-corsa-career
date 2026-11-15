import { GT_WORLD_CHALLENGE_ENDURANCE_2024 } from './gt-world-challenge-endurance-2024.ts';
import { reclassed } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * GT World Challenge Europe Endurance Cup, 2024 - on URD's GT3 cars.
 *
 * The same season as GT_WORLD_CHALLENGE_ENDURANCE_2024, its calendar,
 * formats, points and field, on the GT3 (URD) spec: URD's Aston Martin, BMW,
 * Corvette, Ferrari, Ford, Lexus and Porsche. A copy rather than more cars in
 * the original, because URD's GT3s never share a class with another maker's
 * and the original keeps racing LFM's.
 *
 * Source: https://en.wikipedia.org/wiki/2024_GT_World_Challenge_Europe_Endurance_Cup
 */
export const GT_WORLD_CHALLENGE_ENDURANCE_2024_URD: Championship = {
  ...GT_WORLD_CHALLENGE_ENDURANCE_2024,
  id: 'gt-world-challenge-endurance-2024-urd',
  name: 'GT World Challenge Europe Endurance Cup 2024 (URD)',
  description: {
    en: 'Europe\'s GT3 endurance series of 2024 on URD\'s GT3 cars: three hours at Paul Ricard, the '
      + 'Nurburgring and Monza, and the Spa 24 Hours.',
    uk: 'Європейська серія гонок на витривалість GT3 сезону 2024 на машинах GT3 від URD: три години в '
      + 'Поль-Рікарі, на Нюрбургринзі та в Монці і 24 години Спа.',
  },
  entries: reclassed(GT_WORLD_CHALLENGE_ENDURANCE_2024, { kind: 'spec', spec: CarSpec.GT3_URD }),
};
