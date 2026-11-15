import { GT_WORLD_CHALLENGE_ENDURANCE_2024 } from './gt-world-challenge-endurance-2024.ts';
import { reclassed } from './utils.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * GT World Challenge Europe Endurance Cup, 2024 - on First Studio Race's cars.
 *
 * The same season as GT_WORLD_CHALLENGE_ENDURANCE_2024, its formats, points
 * and field, with FSR's cars. A copy rather than more cars in the original,
 * because FSR's cars never share a class with another maker's and the original
 * keeps racing without them. The GT3 (FSR) spec: the Aston Martin Vantage, the
 * Audi R8 LMS Evo II, the Ferrari 296, the Lamborghini Huracan Evo 2, the
 * McLaren 720S Evo in its endurance version and the 992 GT3 R that raced the
 * season, with the Mustang GT3, its entry not checked, and the Toyota GR GT3,
 * which never raced. The BMW M4 and the Mercedes-AMG have no FSR car.
 *
 * Four of five rounds at their real lengths, in the real order: three hours at
 * Paul Ricard, the Spa 24 Hours with its Superpole of the fastest twenty, and
 * three hours at the Nurburgring and Monza. Jeddah's only known version has
 * twenty-six boxes for thirty-six cars. The Nurburgring's and Paul Ricard's
 * thirty-six boxes cap a grid that ran fifty at Spa. The Pro, Gold, Silver
 * and Bronze cups share one grid and one class here; qualifying is one session
 * where the real one averages three drivers'.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 with a point for pole. The Spa 24 Hours
 * paid points at six and twelve hours as well as at the finish, which a points
 * system cannot say yet. The field is invented, the original's.
 *
 * Source: https://en.wikipedia.org/wiki/2024_GT_World_Challenge_Europe_Endurance_Cup
 */
export const GT_WORLD_CHALLENGE_ENDURANCE_2024_FSR: Championship = {
  ...GT_WORLD_CHALLENGE_ENDURANCE_2024,
  id: 'gt-world-challenge-endurance-2024-fsr',
  name: 'GT World Challenge Europe Endurance Cup 2024 (FSR)',
  description: {
    en: 'Europe\'s GT3 endurance series of 2024 on First Studio Race\'s GT3 cars: three hours at Paul '
      + 'Ricard, the Nurburgring and Monza, and the Spa 24 Hours.',
    uk: 'Європейська серія гонок на витривалість GT3 сезону 2024 на машинах GT3 від First Studio Race: '
      + 'три години в Поль-Рікарі, на Нюрбургринзі та в Монці і 24 години Спа.',
  },
  entries: reclassed(GT_WORLD_CHALLENGE_ENDURANCE_2024, { kind: 'spec', spec: CarSpec.GT3_FSR }),
};
