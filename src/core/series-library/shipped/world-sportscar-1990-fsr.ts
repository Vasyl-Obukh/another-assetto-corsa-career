import { reclassed } from './utils.ts';
import { WORLD_SPORTSCAR_1990 } from './world-sportscar-1990.ts';
import { CarSpec } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * World Sports-Prototype Championship, 1990 - on First Studio Race's cars.
 *
 * The same season as WORLD_SPORTSCAR_1990, its field and points, with FSR's
 * cars. A copy rather than more cars in the original, because FSR's cars never
 * share a class with another maker's and the original keeps racing without
 * them. The Group C (FSR) spec: the Porsche 962 C and the Nissan R90CK that
 * raced the season, the Jaguar XJR-12 standing in for the XJR-11 Jaguar raced
 * in the championship, and the Alfa Romeo SE 048SP, built for the 3.5-litre
 * rules that followed and never raced. The Mercedes C11 that won the season
 * has no FSR car.
 *
 * Every round of 1990 ran 480 kilometres. Eight of its nine circuits are
 * raced - Suzuka, Monza, Silverstone, Spa, the Nurburgring, Donington,
 * Montreal and Mexico City - each over the laps 480 kilometres takes on the
 * recommended layout. Dijon has no recommended track. Points are the season's
 * 20-15-12-10-8-6-4-3-2-1.
 *
 * The field is invented, WORLD_SPORTSCAR_1990's.
 *
 * Source: https://en.wikipedia.org/wiki/1990_World_Sports_Prototype_Championship
 */
export const WORLD_SPORTSCAR_1990_FSR: Championship = {
  ...WORLD_SPORTSCAR_1990,
  id: 'world-sportscar-1990-fsr',
  name: 'World Sports-Prototype Championship 1990 (FSR)',
  description: {
    en: 'Group C at its height on First Studio Race\'s cars: the Porsche 962 C, the Nissan R90CK and '
      + 'the Jaguar XJR-12 over eight rounds of 480 kilometres.',
    uk: 'Група C у розквіті на машинах First Studio Race: Porsche 962 C, Nissan R90CK і Jaguar XJR-12 '
      + 'на восьми етапах по 480 кілометрів.',
  },
  entries: reclassed(WORLD_SPORTSCAR_1990, { kind: 'spec', spec: CarSpec.GROUP_C_FSR }),
};
