import { Discipline } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Lotus Cup - two classes, one calendar, one grid.
 *
 * The multi-class exemplar, and a real championship rather than a shape
 * invented to exercise the schema: Lotus Cup Europe runs its own classes on one
 * entry list with separate standings, and every car it needs is base content.
 *
 * Base Assetto Corsa ships no prototype class, so WEC's own shape - the
 * Hypercar, LMP2 and LMGT3 example the ladder is described with - cannot be
 * built base-only. This is the closest real thing that can, and it exercises
 * the same three things: two class entries on one shared grid, a tier per class
 * entry rather than per championship, and balance of performance applied to the
 * AI and to the player alike.
 *
 * It is also the only shipped championship on the road discipline, which
 * nothing else would reach - road cars carry no spec on purpose, so a series
 * gets at them by naming them.
 */
export const LOTUS_CUP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'lotus-cup',
  name: 'Lotus Cup',
  notes: 'Two classes sharing one grid and one calendar, scored separately. The Open cars are '
    + 'balanced against each other; Production runs the road cars as they come.',
  entries: [
    {
      id: 'open',
      name: 'Open',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      entrants: 8,
      eligibility: {
        kind: 'cars',
        cars: ['lotus_2_eleven', 'lotus_exige_v6_cup', 'lotus_evora_gx'],
      },
      bop: [
        { car: 'lotus_evora_gx', ballast: 90, restrictor: 12 },
        { car: 'lotus_exige_v6_cup', ballast: 30 },
      ],
    },
    {
      id: 'production',
      name: 'Production',
      ladder: { discipline: Discipline.ROAD, tier: 5 },
      entrants: 8,
      eligibility: {
        kind: 'cars',
        cars: ['lotus_elise_sc', 'lotus_exige_s', 'lotus_exige_240'],
      },
      grid: { aiLevel: 86, aiLevelMin: 78 },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 25, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        { type: 'race', name: 'Race', minutes: 25, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    { id: 'magione', name: 'Magione', track: { id: 'magione' } },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'zandvoort', name: 'Zandvoort', track: { id: 'ks_zandvoort' } },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' } },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 90, aiLevelMin: 82, aiAggression: 30 },
  regulations: {
    assists: { damage: 50, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2000,
  prizes: {
    positions: [6000, 4200, 3000, 2200, 1600, 1200, 900, 600, 400, 200],
    standings: [45000, 27000, 18000, 12000, 7500],
  },
};
